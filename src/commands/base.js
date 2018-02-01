/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added Command.module
 - Added Command.moduleID
 - Added Command.editTimeout()
 - Added Command.preloadLocalization()
 - Added Command.reactTimeout()
 - Added Command.runReact()
 - Added Command.shouldHandleReaction()
 - Added Command.setWhitelistIn()
 - Added Command.setBlacklistIn()
 - Added Command.clearWhitelistIn()
 - Added Command.isWhitelistedIn()
 - Changed Command.reload()
 */

const ArgumentCollector = require('./collector');
const CommandLocaleHelper = require('../providers/locale/command-helper');
const { permissions } = require('../util');

/**
 * A command that can be run in a client
 */
class Command {
    /**
     * @typedef {Object} ThrottlingOptions
     * @property {number} usages - Maximum number of usages of the command allowed in the time frame
     * @property {number} duration - Amount of time to count the usages of the command within (in seconds)
     */

    /**
     * @typedef {Object} CommandInfo
     * @property {string} name - The name of the command (must be lowercase)
     * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
     * @property {boolean} [autoAliases=true] - Whether automatic aliases should be added
     * @property {string} group - The ID of the group the command belongs to (must be lowercase)
     * @property {string} module - The ID of the module the command belongs to (must be lowercase)
     * @property {string} memberName - The member name of the command in the group (must be lowercase)
     * @property {string} [description] - The localization key that will be used to get the short description of the
     * command. Defaults to `description`.
     * @property {string} [format] - The command usage format string - will be automatically generated if not specified,
     * and `args` is specified
     * @property {string} [details] - The localization key that will be used to get the detailed description of the
     * command and its functionality. Defaults to `details`. Set to `null` to disable.
     * @property {string[]} [examples] - Usage examples of the command
     * @property {boolean} [guildOnly=false] - Whether or not the command should only function in a guild channel
     * @property {boolean} [ownerOnly=false] - Whether or not the command is usable only by an owner
     * @property {PermissionResolvable[]} [clientPermissions] - Permissions required by the client to use the command
     * @property {PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command
     * @property {boolean} [nsfw=false] - Whether the command is usable only in NSFW channels
     * @property {ThrottlingOptions} [throttling] - Options for throttling usages of the command
     * @property {boolean} [defaultHandling=true] - Whether or not the default command handling should be used.
     * If false, then only patterns will trigger the command.
     * @property {ArgumentInfo[]} [args] - Arguments for the command. The prompt is a localization key that defaults to
     * `args.<arg_key>-prompt`.
     * @property {number} [argsPromptLimit=Infinity] - Maximum number of times to prompt a user for a single argument.
     * Only applicable if `args` is specified.
     * @property {string} [argsType=single] - One of 'single' or 'multiple'. Only applicable if `args` is not specified.
     * When 'single', the entire argument string will be passed to run as one argument.
     * When 'multiple', it will be passed as multiple arguments.
     * @property {number} [argsCount=0] - The number of arguments to parse from the command string.
     * Only applicable when argsType is 'multiple'. If nonzero, it should be at least 2.
     * When this is 0, the command argument string will be split into as many arguments as it can be.
     * When nonzero, it will be split into a maximum of this number of arguments.
     * @property {boolean} [argsSingleQuotes=true] - Whether or not single quotes should be allowed to box-in arguments
     * in the command string
     * @property {RegExp[]} [patterns] - Patterns to use for triggering the command
     * @property {boolean} [guarded=false] - Whether the command should be protected from disabling
     */

    /**
     * @param {CommandoClient} client - The client the command is for
     * @param {CommandInfo} info - The command information
     */
    constructor(client, info) { // eslint-disable-line complexity
        this.constructor.validateInfo(client, info);

        /**
         * Client that this command is for.
         * @name Command#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * Name of this command.
         * @type {string}
         */
        this.name = info.name;

        /**
         * Aliases for this command.
         * @type {string[]}
         */
        this.aliases = info.aliases || [];
        if (typeof info.autoAliases === 'undefined' || info.autoAliases) {
            if (this.name.includes('-')) {
                this.aliases.push(this.name.replace(/-/g, ''));
            }
            for (const alias of this.aliases) {
                if (alias.includes('-')) {
                    this.aliases.push(alias.replace(/-/g, ''));
                }
            }
        }

        /**
         * ID of the group the command belongs to.
         * @type {string}
         */
        this.groupID = info.group;

        /**
         * The group the command belongs to, assigned upon registration.
         * @type {?CommandGroup}
         */
        this.group = null;

        /**
         * ID of the module the command belongs to.
         * @type {string}
         */
        this.moduleID = info.module;

        /**
         * The module the command belongs to, assigned upon registration through a module.
         * @type {?Module}
         */
        this.module = null;

        /**
         * Name of the command within the group.
         * @type {string}
         */
        this.memberName = info.memberName;

        /**
         * Locale key for the short description of the command.
         * @type {string}
         */
        this.description = typeof info.description === 'undefined' ? 'description' : info.description;

        /**
         * Usage format string of the command.
         * @type {string}
         */
        this.format = info.format || null;

        /**
         * Locale key for the long description of the command.
         * @type {?string}
         */
        this.details = typeof info.details === 'undefined' ? 'details' : info.details;

        /**
         * Example usage strings.
         * @type {?string[]}
         */
        this.examples = info.examples || null;

        /**
         * Whether the command can only be run in a guild channel.
         * @type {boolean}
         */
        this.guildOnly = Boolean(info.guildOnly);

        /**
         * Whether the command can only be used by an owner.
         * @type {boolean}
         */
        this.ownerOnly = Boolean(info.ownerOnly);

        /**
         * Permissions required by the client to use the command.
         * @type {?PermissionResolvable[]}
         */
        this.clientPermissions = info.clientPermissions || null;

        /**
         * Permissions required by the user to use the command.
         * @type {?PermissionResolvable[]}
         */
        this.userPermissions = info.userPermissions || null;

        /**
         * Whether the command can only be used in NSFW channels.
         * @type {boolean}
         */
        this.nsfw = Boolean(info.nsfw);

        /**
         * Whether the default command handling is enabled for the command.
         * @type {boolean}
         */
        this.defaultHandling = 'defaultHandling' in info ? info.defaultHandling : true;

        /**
         * Options for throttling command usages.
         * @type {?ThrottlingOptions}
         */
        this.throttling = info.throttling || null;

        // Assign arg prompts localization keys
        if (info.args) {
            for (const arg of info.args) {
                if (typeof arg.prompt === 'undefined') {
                    arg.prompt = `args.${arg.key}-prompt`;
                }
            }
        }

        /**
         * The argument collector for the command.
         * @type {?ArgumentCollector}
         */
        this.argsCollector = info.args ? new ArgumentCollector(client, info.args, info.argsPromptLimit) : null;
        if (this.argsCollector && typeof info.format === 'undefined') {
            this.format = this.argsCollector.args.reduce((prev, arg) => {
                const wrapL = arg.default !== null ? '[' : '<';
                const wrapR = arg.default !== null ? ']' : '>';
                return `${prev}${prev ? ' ' : ''}${wrapL}${arg.label}${arg.infinite ? '...' : ''}${wrapR}`;
            }, '');
        }

        /**
         * How the arguments are split when passed to the command's run method.
         * @type {string}
         */
        this.argsType = info.argsType || 'single';

        /**
         * Maximum number of arguments that will be split.
         * @type {number}
         */
        this.argsCount = info.argsCount || 0;

        /**
         * Whether single quotes are allowed to encapsulate an argument.
         * @type {boolean}
         */
        this.argsSingleQuotes = 'argsSingleQuotes' in info ? info.argsSingleQuotes : true;

        /**
         * Regular expression triggers.
         * @type {RegExp[]}
         */
        this.patterns = info.patterns || null;

        /**
         * Whether the command is protected from being disabled.
         * @type {boolean}
         */
        this.guarded = Boolean(info.guarded);

        /**
         * Whether the command is enabled globally.
         * @type {boolean}
         * @private
         */
        this._globalEnabled = true;

        /**
         * Current throttle objects for the command, mapped by user ID.
         * @type {Map<string, Object>}
         * @private
         */
        this._throttles = new Map();

        /**
         * Shortcut to use locale provider methods for the command locales.
         * @type {CommandLocaleHelper}
         */
        this.localization = new CommandLocaleHelper(client, this);
    }

    /**
     * This is called automatically whenever the ability to edit a command message has timed out.
     * @param {CommandMessage} message - The message
     * @param {Message} response - The response to the command
     * @return {Promise<CommandMessage>} The promise to the message.
     */
    editTimeout(message, response) { // eslint-disable-line no-unused-vars
        return message;
    }

    /**
     * Checks if the user has permission to use the command.
     * @param {CommandMessage} message - The triggering command message
     * @param {boolean} [ownerOverride=true] - Whether the bot owner(s) will always have permission
     * @return {boolean|string} Whether the user has permission, or an error message to respond with if they don't.
     */
    hasPermission(message, ownerOverride = true) {
        if (!this.ownerOnly && !this.userPermissions) {
            return true;
        }
        if (ownerOverride && this.client.isOwner(message.author)) {
            return true;
        }
        if (this.ownerOnly && (ownerOverride || !this.client.isOwner(message.author))) {
            return this.client.localization.tl('errors', 'command-owner-only', message.guild, { command: this.name });
        }

        if (message.channel.type === 'text' && this.userPermissions) {
            const missing = message.channel.permissionsFor(message.author).missing(this.userPermissions);
            return missing.length === 1 ?
                this.client.localization.tl('errors', 'command-missing-permission', message.guild,
                    { permission: permissions[missing[0]] }) :
                this.client.localization.tl('errors', 'command-missing-permissions', message.guild,
                    { permissions: missing.map(p => permissions[p]).join(', ') });
        }

        return true;
    }

    /**
     * Preloads the localizer for this command.
     * @param {CommandMessage} message - The message
     * @return {Promise<void>} The promise.
     * @private
     */
    preloadLocalization(message) {
        return this.client.localeProvider.preloadNamespace(`${this.moduleID}#${this.groupID}`,
            message && message.guild ? message.guild.language : this.client.language);
    }
    /**
     * This is called automatically whenever the ability to react to a message has timed out.
     * The existing reactions are still available.
     * @param {CommandMessage} message - The message
     * @param {Message} response - The response to the command
     * @return {Promise<CommandMessage>} The promise to the message.
     */
    reactTimeout(message, response) { // eslint-disable-line no-unused-vars
        return message;
    }

    /**
     * Runs the command.
     * @param {CommandMessage} message - The message the command is being run for
     * @param {Object|string|string[]} args - The arguments for the command, or the matches from a pattern.
     * If args is specified on the command, this will be the argument values object. If argsType is single, then only
     * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
     * matches array from the pattern match (see
     * [RegExp#exec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)).
     * @param {boolean} fromPattern - Whether or not the command is being run from a pattern match
     * @return {Promise<?Message|?Array<Message>>} The reply message(s).
     * @abstract
     */
    run(message, args, fromPattern) { // eslint-disable-line no-unused-vars
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }

    /**
     * Runs the command with a reaction (optional).
     * @param {CommandMessage} message - The message the command is being run for
     * @param {MessageReaction} reaction - The message reaction
     * @return {Promise<?Message>} The promise to a message.
     * @abstract
     */
    runReact(message, reaction) { // eslint-disable-line no-unused-vars

    }

    /**
     * Determines whether or not the reaction should be handled. If false, the reaction will be removed.
     * @param {CommandMessage} message - The message that is being reacted on
     * @param {MessageReaction} reaction - The message reaction
     * @param {User} user - The user
     * @return {boolean} True if the reaction should be handled; false otherwise.
     */
    shouldHandleReaction(message, reaction, user) { // eslint-disable-line no-unused-vars
        return true;
    }

    /**
     * Creates/obtains the throttle object for a user, if necessary (owners are excluded).
     * @param {string} userID - ID of the user to throttle for
     * @return {?Object} The throttle object.
     * @private
     */
    throttle(userID) {
        if (!this.throttling || this.client.isOwner(userID)) {
            return null;
        }

        let throttle = this._throttles.get(userID);
        if (!throttle) {
            throttle = {
                start: Date.now(),
                usages: 0,
                timeout: this.client.setTimeout(() => {
                    this._throttles.delete(userID);
                }, this.throttling.duration * 1000)
            };
            this._throttles.set(userID, throttle);
        }

        return throttle;
    }

    /**
     * Sets the whitelisted channels of a command in a guild.
     * @param {GuildResolvable} guild - Guild to set the whitelisted channels of the command in
     * @param {ChannelResolvable[]} list - The list of channels
     * @return {void}
     */
    setWhitelistIn(guild, list) {
        if (!guild) {
            throw new TypeError('Guild must not be undefined');
        }
        if (typeof list === 'undefined') {
            throw new TypeError('List must not be undefined');
        }
        guild = this.client.resolver.resolveGuild(guild);
        list = list.map(c => this.client.resolver.resolveChannel(c).id);

        guild.settings.set(`whitelisted-channels.${this.name}`, list);
        guild.settings.remove(`blacklisted-channels.${this.name}`);
    }

    /**
     * Sets the blacklisted channels of a command in a guild.
     * @param {GuildResolvable} guild - Guild to set the blacklisted channels of the command in
     * @param {ChannelResolvable[]} list - The list of channels
     * @return {void}
     */
    setBlacklistIn(guild, list) {
        if (!guild) {
            throw new TypeError('Guild must not be undefined');
        }
        if (typeof list === 'undefined') {
            throw new TypeError('List must not be undefined');
        }
        guild = this.client.resolver.resolveGuild(guild);
        list = list.map(c => this.client.resolver.resolveChannel(c).id);

        guild.settings.set(`blacklisted-channels.${this.name}`, list);
        guild.settings.remove(`whitelisted-channels.${this.name}`);
    }

    /**
     * Clears the whitelisted channels of a command in a guild.
     * @param {GuildResolvable} guild - Guild to set the whitelisted channels of the command in
     * @return {void}
     */
    clearWhitelistIn(guild) {
        if (!guild) {
            throw new TypeError('Guild must not be undefined');
        }
        guild = this.client.resolver.resolveGuild(guild);

        guild.settings.remove(`blacklisted-channels.${this.name}`);
        guild.settings.remove(`whitelisted-channels.${this.name}`);
    }

    /**
     * Checks if the channel is whitelisted for a command.
     * If a command has not been explicitly whitelisted nor blacklisted, this returns true.
     * @param {GuildResolvable} guild - Guild to set the whitelisted channels of the command in
     * @param {ChannelResolvable} channel - The channel to check
     * @return {boolean} True if whitelisted; false otherwise.
     */
    isWhitelistedIn(guild, channel) {
        if (!guild) {
            return true;
        }
        guild = this.client.resolver.resolveGuild(guild);
        channel = this.client.resolver.resolveChannel(channel).id;

        const whitelist = guild.settings.get(`whitelisted-channels.${this.name}`, []);
        if (whitelist.length > 0) {
            return whitelist.includes(channel);
        }
        const blacklist = guild.settings.get(`blacklisted-channels.${this.name}`, []);
        if (blacklist.length > 0) {
            return !blacklist.includes(channel);
        }
        return true;
    }

    /**
     * Enables or disables the command in a guild.
     * @param {?GuildResolvable} guild - Guild to enable/disable the command in
     * @param {boolean} enabled - Whether the command should be enabled or disabled
     * @return {void}
     */
    setEnabledIn(guild, enabled) {
        if (typeof guild === 'undefined') {
            throw new TypeError('Guild must not be undefined.');
        }
        if (typeof enabled === 'undefined') {
            throw new TypeError('Enabled must not be undefined.');
        }
        if (this.guarded) {
            throw new Error('The command is guarded.');
        }
        if (!guild) {
            this._globalEnabled = enabled;
            this.client.emit('commandStatusChange', null, this, enabled);
            return;
        }
        guild = this.client.resolver.resolveGuild(guild);
        guild.setCommandEnabled(this, enabled);
    }

    /**
     * Checks if the command is enabled in a guild.
     * @param {?GuildResolvable} guild - Guild to check in
     * @return {boolean} True if enabled; false otherwise.
     */
    isEnabledIn(guild) {
        if (this.guarded) {
            return true;
        }
        if (!guild) {
            return this.group._globalEnabled && this._globalEnabled;
        }
        guild = this.client.resolver.resolveGuild(guild);
        return guild.isGroupEnabled(this.group) && guild.isCommandEnabled(this);
    }

    /**
     * Checks if the command is usable for a message.
     * @param {?Message} message - The message
     * @return {boolean} True if usable; false otherwise.
     */
    isUsable(message = null) {
        if (!message) {
            return this._globalEnabled;
        }
        if (this.guildOnly && message && !message.guild) {
            return false;
        }
        const hasPermission = this.hasPermission(message);
        return this.isEnabledIn(message.guild) && hasPermission && typeof hasPermission !== 'string';
    }

    /**
     * Creates a usage string for the command.
     * @param {string} [argString] - A string of arguments for the command
     * @param {string} [prefix=this.client.commandPrefix] - Prefix to use for the prefixed command format
     * @param {User} [user=this.client.user] - User to use for the mention command format
     * @return {string} The command usage string.
     */
    usage(argString, prefix = this.client.commandPrefix, user = this.client.user) {
        return this.constructor.usage(`${this.name}${argString ? ` ${argString}` : ''}`, prefix, user);
    }

    /**
     * Reloads the command.
     * @return {void}
     */
    reload() {
        let cmdPath, cached, newCmd;
        try {
            cmdPath = this.client.registry.resolveCommandPath(this.moduleID, this.groupID, this.memberName);
            cached = require.cache[cmdPath];
            delete require.cache[cmdPath];
            newCmd = require(cmdPath);
        } catch (err) {
            if (cached) {
                require.cache[cmdPath] = cached;
            }
            throw err;
        }

        this.client.registry.reregisterCommand(newCmd, this);
    }

    /**
     * Unloads the command.
     * @return {void}
     */
    unload() {
        const cmdPath = this.client.registry.resolveCommandPath(this.moduleID, this.groupID, this.memberName);
        if (!require.cache[cmdPath]) {
            throw new Error('Command cannot be unloaded.');
        }
        delete require.cache[cmdPath];
        this.client.registry.unregisterCommand(this);
    }

    /**
     * Creates a usage string for a command.
     * @param {string} command - A command + arg string
     * @param {string} [prefix] - Prefix to use for the prefixed command format
     * @param {User} [user] - User to use for the mention command format
     * @return {string} The command usage string.
     */
    static usage(command, prefix = null, user = null) {
        const nbcmd = command.replace(/ /g, '\xa0');
        if (!prefix && !user) {
            return `\`${nbcmd}\``;
        }

        let prefixPart;
        if (prefix) {
            if (prefix.length > 1 && !prefix.endsWith(' ')) {
                prefix += ' ';
            }
            prefix = prefix.replace(/ /g, '\xa0');
            prefixPart = `\`${prefix}${nbcmd}\``;
        }

        let mentionPart;
        if (user) {
            mentionPart = `\`@${user.username.replace(/ /g, '\xa0')}#${user.discriminator}\xa0${nbcmd}\``;
        }

        return `${prefixPart || ''}${prefix && user ? ' / ' : ''}${mentionPart || ''}`;
    }

    /**
     * Validates the constructor parameters.
     * @param {CommandoClient} client - Client to validate
     * @param {CommandInfo} info - Info to validate
     * @return {void}
     * @private
     */
    static validateInfo(client, info) { // eslint-disable-line complexity
        if (!client) {
            throw new Error('A client must be specified.');
        }
        if (typeof info !== 'object') {
            throw new TypeError('Command info must be an Object.');
        }
        if (typeof info.name !== 'string') {
            throw new TypeError('Command name must be a string.');
        }
        if (info.name !== info.name.toLowerCase()) {
            throw new Error('Command name must be lowercase.');
        }
        if (info.aliases && (!Array.isArray(info.aliases) || info.aliases.some(ali => typeof ali !== 'string'))) {
            throw new TypeError('Command aliases must be an Array of strings.');
        }
        if (info.aliases && info.aliases.some(ali => ali !== ali.toLowerCase())) {
            throw new Error('Command aliases must be lowercase.');
        }
        if (typeof info.group !== 'string') {
            throw new TypeError('Command group must be a string.');
        }
        if (info.group !== info.group.toLowerCase()) {
            throw new Error('Command group must be lowercase.');
        }
        if (typeof info.module !== 'string') {
            throw new TypeError('Command module must be a string.');
        }
        if (info.module !== info.module.toLowerCase()) {
            throw new Error('Command module must be lowercase.');
        }
        if (typeof info.memberName !== 'string') {
            throw new TypeError('Command memberName must be a string.');
        }
        if (info.memberName !== info.memberName.toLowerCase()) {
            throw new Error('Command memberName must be lowercase.');
        }
        if ('description' in info && typeof info.description !== 'string') {
            throw new TypeError('Command description must be a string.');
        }
        if ('format' in info && typeof info.format !== 'string') {
            throw new TypeError('Command format must be a string.');
        }
        if ('details' in info && typeof info.details !== 'string') {
            throw new TypeError('Command details must be a string.');
        }
        if (info.examples && (!Array.isArray(info.examples) || info.examples.some(ex => typeof ex !== 'string'))) {
            throw new TypeError('Command examples must be an Array of strings.');
        }
        if (info.clientPermissions) {
            if (!Array.isArray(info.clientPermissions)) {
                throw new TypeError('Command clientPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.clientPermissions) {
                if (!permissions[perm]) {
                    throw new RangeError(`Invalid command clientPermission: ${perm}`);
                }
            }
        }
        if (info.userPermissions) {
            if (!Array.isArray(info.userPermissions)) {
                throw new TypeError('Command userPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.userPermissions) {
                if (!permissions[perm]) {
                    throw new RangeError(`Invalid command userPermission: ${perm}`);
                }
            }
        }
        if (info.throttling) {
            if (typeof info.throttling !== 'object') {
                throw new TypeError('Command throttling must be an Object.');
            }
            if (typeof info.throttling.usages !== 'number' || isNaN(info.throttling.usages)) {
                throw new TypeError('Command throttling usages must be a number.');
            }
            if (info.throttling.usages < 1) {
                throw new RangeError('Command throttling usages must be at least 1.');
            }
            if (typeof info.throttling.duration !== 'number' || isNaN(info.throttling.duration)) {
                throw new TypeError('Command throttling duration must be a number.');
            }
            if (info.throttling.duration < 1) {
                throw new RangeError('Command throttling duration must be at least 1.');
            }
        }
        if (info.args && !Array.isArray(info.args)) {
            throw new TypeError('Command args must be an Array.');
        }
        if ('argsPromptLimit' in info && typeof info.argsPromptLimit !== 'number') {
            throw new TypeError('Command argsPromptLimit must be a number.');
        }
        if ('argsPromptLimit' in info && info.argsPromptLimit < 0) {
            throw new RangeError('Command argsPromptLimit must be at least 0.');
        }
        if (info.argsType && !['single', 'multiple'].includes(info.argsType)) {
            throw new RangeError('Command argsType must be one of "single" or "multiple".');
        }
        if (info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
            throw new RangeError('Command argsCount must be at least 2.');
        }
        if (info.patterns && (!Array.isArray(info.patterns) || info.patterns.some(pat => !(pat instanceof RegExp)))) {
            throw new TypeError('Command patterns must be an Array of regular expressions.');
        }
    }
}

module.exports = Command;
