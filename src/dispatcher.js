/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added support for reactable commands
 - Added CommandDispatcher._commandResponses to support reactable commands
 - Chagned CommandDispatcher._results to support reactable commands
 - Changed CommandDispatcher.cacheCommandMessage() to support reactable commands
 - Changed CommandDispatcher.handleMessage() to support additional changes for supporting reactable commands
 - Changed CommandDispatcher.handleReaction() to support reactable commands
 - Changed CommandDispatcher.shouldHandleReaction() to support reactable commands
 */

const escapeRegex = require('escape-string-regexp');
const CommandMessage = require('./commands/message');

/**
 * Handles parsing messages and running commands from them
 */
class CommandDispatcher {
    /**
     * @param {CommandoClient} client - Client the dispatcher is for
     * @param {CommandRegistry} registry - Registry the dispatcher will use
     */
    constructor(client, registry) {
        /**
         * Client this dispatcher handles messages for.
         * @name CommandDispatcher#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * Registry this dispatcher uses.
         * @type {CommandRegistry}
         */
        this.registry = registry;

        /**
         * Functions that can block commands from running.
         * @type {Set<function>}
         */
        this.inhibitors = new Set();

        /**
         * Map object of {@link RegExp}s that match command messages, mapped by string prefix.
         * @type {Object}
         * @private
         */
        this._commandPatterns = {};

        /**
         * Old command message results, mapped by original message ID.
         * @type {Map<string, { message: CommandMessage, timeoutIds: { edit: Object, react: Object } }>}
         * @private
         */
        this._results = new Map();

        /**
         * Mapping of bot command response message ids to their triggering command message ids.
         * @type {Map<string, string>}
         * @private
         */
        this._commandResponses = new Map();

        /**
         * Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a
         * channel.
         * @type {Set<string>}
         * @private
         */
        this._awaiting = new Set();
    }

    /**
     * A function that can block the usage of a command - these functions are passed the command message that is
     * triggering the command. They should return `false` if the command should *not* be blocked. If the command
     * *should* be blocked, they should return one of the following:
     * - A single string identifying the reason the command is blocked
     * - An array of the above string as element 0, and a response promise or `null` as element 1
     * @typedef {Function} Inhibitor
     */

    /**
     * Adds an inhibitor.
     * @param {Inhibitor} inhibitor - The inhibitor function to add
     * @return {boolean} Whether the addition was successful.
     * @example
     * client.dispatcher.addInhibitor(msg => {
	 *   if(blacklistedUsers.has(msg.author.id)) return 'blacklisted';
	 * });
     * @example
     * client.dispatcher.addInhibitor(msg => {
	 * 	if(!coolUsers.has(msg.author.id)) return ['cool', msg.reply('You\'re not cool enough!')];
	 * });
     */
    addInhibitor(inhibitor) {
        if (typeof inhibitor !== 'function') {
            throw new TypeError('The inhibitor must be a function.');
        }
        if (this.inhibitors.has(inhibitor)) {
            return false;
        }
        this.inhibitors.add(inhibitor);
        return true;
    }

    /**
     * Removes an inhibitor.
     * @param {Inhibitor} inhibitor - The inhibitor function to remove
     * @return {boolean} Whether the removal was successful.
     */
    removeInhibitor(inhibitor) {
        if (typeof inhibitor !== 'function') {
            throw new TypeError('The inhibitor must be a function.');
        }
        return this.inhibitors.delete(inhibitor);
    }

    /**
     * Handle a new message or a message update.
     * @param {Message} message - The message to handle
     * @param {Message} [oldMessage] - The old message before the update
     * @return {Promise<void>} The promise.
     * @private
     */
    async handleMessage(message, oldMessage) {
        if (!this.shouldHandleMessage(message, oldMessage)) {
            return;
        }

        // Parse the message, and get the old result if it exists
        let cmdMsg, cmdResult, oldCmdMsg, timeoutIds;
        if (oldMessage) {
            cmdResult = this._results.get(oldMessage.id);
            oldCmdMsg = cmdResult.message;
            timeoutIds = cmdResult.timeoutIds;
            if (!oldCmdMsg && !this.client.options.nonCommandEditable) {
                return;
            }
            cmdMsg = this.parseMessage(message);
            if (cmdMsg && oldCmdMsg) {
                cmdMsg.responses = oldCmdMsg.responses;
                cmdMsg.responsePositions = oldCmdMsg.responsePositions;
            }
        } else {
            cmdMsg = this.parseMessage(message);
        }

        // Run the command, or reply with an error
        let responses;
        if (cmdMsg) {
            const inhibited = this.inhibit(cmdMsg);

            if (!inhibited) {
                if (cmdMsg.command) {
                    if (!this.client.isOwner(message.author) && !message.member.hasPermission('ADMINISTRATOR') &&
                        !cmdMsg.command.isWhitelistedIn(message.guild, message.channel)) {
                        // Ignore and stop
                        return;
                    } else if (!cmdMsg.command.isEnabledIn(message.guild)) {
                        responses = await cmdMsg.reply(this.client.localization.tl(
                            'errors', 'command-disabled', message.guild, { command: cmdMsg.command.name }));
                    } else if (!oldMessage || typeof oldCmdMsg !== 'undefined') {
                        responses = await cmdMsg.run();
                        if (typeof responses === 'undefined') { // eslint-disable-line max-depth
                            responses = null;
                        }
                    }
                } else {
                    /**
                     * Emitted when an unknown command is triggered.
                     * @event CommandoClient#unknownCommand
                     * @param {CommandMessage} message - Command message that triggered the command
                     */
                    this.client.emit('unknownCommand', cmdMsg);
                    if (this.client.options.unknownCommandResponse) {
                        responses = await cmdMsg.reply(this.client.localization.tl(
                            'errors', 'command-unknown', message.guild, {
                                usage: cmdMsg.anyUsage('help',
                                    message.guild ? undefined : null, message.guild ? undefined : null)
                            }));
                    }
                }
            } else {
                responses = await inhibited[1];
            }

            cmdMsg.finalize(responses);
        } else if (oldCmdMsg) {
            oldCmdMsg.finalize(null);
            if (!this.client.options.nonCommandEditable) {
                this._results.delete(message.id);
            }
        }

        this.cacheCommandMessage(message, oldMessage, cmdMsg, responses, timeoutIds);
    }

    /**
     * Handle a new reaction or a removal of a reaction.
     * @param {MessageReaction} reaction - The message reaction to handle
     * @param {User} user - The Discord user that reacted
     * @return {Promise<void>} The promise that handles the reaction.
     * @private
     */
    async handleReaction(reaction, user) {
        const cmdMsgId = this._commandResponses.get(reaction.message.id);
        if (typeof cmdMsgId === 'undefined') {
            return;
        }

        const { message, timeoutIds } = this._results.get(cmdMsgId);
        if (typeof message === 'undefined' || typeof message.command === 'undefined') {
            return;
        }

        if (!this.shouldHandleReaction(message, reaction, user)) {
            return;
        }

        let responses = await message.command.runReact(message, reaction);
        if (typeof responses === 'undefined') {
            responses = message.responses;
        }

        this.cacheCommandMessage(message.message, message.message, message, responses, timeoutIds);
    }

    /**
     * Check whether a message should be handled.
     * @param {Message} message - The message to handle
     * @param {Message} [oldMessage] - The old message before the update
     * @return {boolean} True if the message should be handled; false otherwise.
     * @private
     */
    shouldHandleMessage(message, oldMessage) {
        if (message.author.bot) {
            return false;
        } else if (this.client.options.selfbot && message.author.id !== this.client.user.id) {
            return false;
        } else if (!this.client.options.selfbot && message.author.id === this.client.user.id) {
            return false;
        }

        // Ignore messages from users that the bot is already waiting for input from
        if (this._awaiting.has(message.author.id + message.channel.id)) {
            return false;
        }

        // Make sure the edit actually changed the message content
        if (oldMessage && message.content === oldMessage.content) {
            return false;
        }

        return true;
    }

    /**
     * Check whether a reaction should be handled.
     * @param {CommandMessage} cmdMsg - The command message
     * @param {MessageReaction} reaction - The message reaction to handle
     * @param {User} user - The Discord user that reacted
     * @return {boolean} True if the reaction should be handled; false otherwise.
     * @private
     */
    shouldHandleReaction(cmdMsg, reaction, user) {
        if (this.client.user.id === user.id) {
            // Ignore our own reactions
            return false;
        }
        return cmdMsg.command.shouldHandleReaction(cmdMsg, reaction, user);
    }

    /**
     * Inhibits a command message.
     * @param {CommandMessage} cmdMsg - Command message to inhibit
     * @return {?Array} [reason, ?response]
     * @private
     */
    inhibit(cmdMsg) {
        for (const inhibitor of this.inhibitors) {
            const inhibited = inhibitor(cmdMsg);
            if (inhibited) {
                this.client.emit('commandBlocked', cmdMsg, inhibited instanceof Array ? inhibited[0] : inhibited);
                return inhibited instanceof Array ? inhibited : [inhibited, undefined];
            }
        }
        return null;
    }

    /**
     * Caches a command message to be editable.
     * @param {Message} message - Triggering message
     * @param {Message} oldMessage - Triggering message's old version
     * @param {CommandMessage} cmdMsg - Command message to cache
     * @param {Message|Message[]} responses - Responses to the message
     * @param {Object} [timeoutIds] - The timeout ids
     * @param {Object} [timeoutIds.edit] - The timeout id that was used to schedule the command edit timeout
     * @param {Object} [timeoutIds.react] - The timeout id that was used to schedule the command reaction timeout
     * @return {void}
     * @private
     */
    cacheCommandMessage(message, oldMessage, cmdMsg, responses, timeoutIds = {}) {
        if (this.client.options.commandEditableDuration <= 0 && this.client.options.commandReactableDuration <= 0) {
            return;
        }
        if (!cmdMsg && !this.client.options.nonCommandEditable) {
            return;
        }
        if (responses !== null) {
            if (timeoutIds.edit) {
                clearTimeout(timeoutIds.edit);
            }
            if (timeoutIds.react) {
                clearTimeout(timeoutIds.react);
            }
            // Only get the last response to listen for reactions
            const reactResponse = Array.isArray(responses) ? responses[responses.length - 1] : responses;

            timeoutIds.edit = setTimeout(async() => {
                await cmdMsg.command.editTimeout(cmdMsg, responses);
                if (this.client.options.commandEditableDuration > this.client.options.commandReactableDuration) {
                    return this._results.delete(message.id);
                }
                return undefined;
            }, this.client.options.commandEditableDuration * 1000);
            timeoutIds.react = setTimeout(async() => {
                await cmdMsg.command.reactTimeout(cmdMsg, responses);
                this._commandResponses.delete(reactResponse.id);
                if (this.client.options.commandReactableDuration > this.client.options.commandEditableDuration) {
                    return this._results.delete(message.id);
                }
                return undefined;
            }, this.client.options.commandReactableDuration * 1000);

            this._results.set(message.id, { message: cmdMsg, timeoutIds });
            this._commandResponses.set(reactResponse.id, message.id);
        } else {
            this._results.delete(message.id);
        }
    }

    /**
     * Parses a message to find details about command usage in it.
     * @param {Message} message - The message
     * @return {?CommandMessage} The command message, if valid.
     * @private
     */
    parseMessage(message) {
        // Find the command to run by patterns
        for (const command of this.registry.commands.values()) {
            if (!command.patterns) {
                continue;
            }
            for (const pattern of command.patterns) {
                const matches = pattern.exec(message.content);
                if (matches) {
                    return new CommandMessage(message, command, null, matches);
                }
            }
        }

        // Find the command to run with default command handling
        const prefix = message.guild ? message.guild.commandPrefix : this.client.commandPrefix;
        if (!this._commandPatterns[prefix]) {
            this.buildCommandPattern(prefix);
        }
        let cmdMsg = this.matchDefault(message, this._commandPatterns[prefix], 2);
        if (!cmdMsg && !message.guild && !this.client.options.selfbot) {
            cmdMsg = this.matchDefault(message, /^([^\s]+)/i);
        }
        return cmdMsg;
    }

    /**
     * Matches a message against a guild command pattern.
     * @param {Message} message - The message
     * @param {RegExp} pattern - The pattern to match against
     * @param {number} commandNameIndex - The index of the command name in the pattern matches
     * @return {?CommandMessage} The command message, if found.
     * @private
     */
    matchDefault(message, pattern, commandNameIndex = 1) {
        const matches = pattern.exec(message.content);
        if (!matches) {
            return null;
        }
        const commands = this.registry.findCommands(matches[commandNameIndex], true);
        if (commands.length !== 1 || !commands[0].defaultHandling) {
            return new CommandMessage(message, null);
        }
        const argString = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0));
        return new CommandMessage(message, commands[0], argString);
    }

    /**
     * Creates a regular expression to match the command prefix and name in a message.
     * @param {?string} prefix - Prefix to build the pattern for
     * @return {RegExp} The regular expression.
     * @private
     */
    buildCommandPattern(prefix) {
        let pattern;
        if (prefix) {
            const escapedPrefix = escapeRegex(prefix);
            pattern = new RegExp(
                `^(<@!?${this.client.user.id}>\\s+(?:${escapedPrefix}\\s*)?|${escapedPrefix}\\s*)([^\\s]+)`, 'i'
            );
        } else {
            pattern = new RegExp(`(^<@!?${this.client.user.id}>\\s+)([^\\s]+)`, 'i');
        }
        this._commandPatterns[prefix] = pattern;
        this.client.emit('debug', `Built command pattern for prefix "${prefix}": ${pattern}`);
        return pattern;
    }
}

module.exports = CommandDispatcher;
