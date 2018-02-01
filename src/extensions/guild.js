/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added GuildExtension.language
 - Added GuildExtension.isWorkerEnabled()
 - Added GuildExtension.setWorkerEnabled()
 */

const Command = require('../commands/base');
const GuildSettingsHelper = require('../providers/settings/helper');

/**
 * Contains additional methods and properties that are added to the discord.js Guild class.
 */
class GuildExtension {
    /**
     * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
     * Setting to `null` means that the prefix from {@link CommandoClient#commandPrefix} will be used instead.
     * @type {string}
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get commandPrefix() {
        if (typeof this._commandPrefix === 'undefined' || this._commandPrefix === null) {
            return this.client.commandPrefix;
        }
        return this._commandPrefix;
    }

    set commandPrefix(prefix) {
        /**
         * Internal command prefix for the guild, controlled by the {@link GuildExtension#commandPrefix} getter/setter.
         * @name GuildExtension#_commandPrefix
         * @type {?string}
         * @private
         */
        this._commandPrefix = prefix;

        /**
         * Emitted whenever a guild's command prefix is changed.
         * @event CommandoClient#commandPrefixChange
         * @param {?Guild} guild - The guild that the prefix was changed of (null for global)
         * @param {?string} prefix - The new command prefix (null for default)
         */
        this.client.emit('commandPrefixChange', this, this._commandPrefix);
    }

    /**
     * The language in the guild. Setting to `null` means that the language from {@link CommandoClient#language} will
     * be used instead.
     * @type {?string}
     * @emits {@link CommandoClient#languageChange}
     */
    get language() {
        if (typeof this._language === 'undefined' || this._language === null) {
            return this.client.language;
        }
        return this._language;
    }

    set language(language) {
        /**
         * Internal language for the guild, controlled by the {@link GuildExtension#language) getter/setter.
         * @name GuildExtension#_language
         * @type {?string}
         * @private
         */
        this._language = language;

        /**
         * Emitted whenever a guild's language is changed.
         * @event CommandoClient#languageChange
         * @param {?Guild} guild - The guild that the language was changed of (null for global)
         * @param {?string} language - The new language (null for default)
         */
        this.client.emit('languageChange', this, this._language);
    }

    /**
     * Shortcut to use settings provider methods for this guild.
     * @type {GuildSettingsHelper}
     * @readonly
     */
    get settings() {
        /**
         * Internal settings helper that is created upon accessing the {@link GuildExtension#settings} getter.
         * @name GuildExtension#_settings
         * @type {GuildSettingsHelper}
         * @private
         */
        if (!this._settings) {
            this._settings = new GuildSettingsHelper(this.client, this);
        }
        return this._settings;
    }

    /**
     * Sets whether a command is enabled in the guild.
     * @param {CommandResolvable} command - Command to set status of
     * @param {boolean} enabled - Whether the command should be enabled
     * @return {void}
     */
    setCommandEnabled(command, enabled) {
        command = this.client.registry.resolveCommand(command);
        if (command.guarded) {
            throw new Error('The command is guarded.');
        }
        if (typeof enabled === 'undefined') {
            throw new TypeError('Enabled must not be undefined.');
        }
        enabled = Boolean(enabled);
        if (!this._commandsEnabled) {
            /**
             * Map object of internal command statuses, mapped by command name
             * @type {Object}
             * @private
             */
            this._commandsEnabled = {};
        }
        this._commandsEnabled[command.name] = enabled;
        /**
         * Emitted whenever a command is enabled/disabled in a guild
         * @event CommandoClient#commandStatusChange
         * @param {?Guild} guild - Guild that the command was enabled/disabled in (null for global)
         * @param {Command} command - Command that was enabled/disabled
         * @param {boolean} enabled - Whether the command is enabled
         */
        this.client.emit('commandStatusChange', this, command, enabled);
    }

    /**
     * Checks whether a command is enabled in the guild (does not take the command's group status into account).
     * @param {CommandResolvable} command - Command to check status of
     * @return {boolean} True if enabled; false otherwise.
     */
    isCommandEnabled(command) {
        command = this.client.registry.resolveCommand(command);
        if (command.guarded) {
            return true;
        }
        if (!this._commandsEnabled || typeof this._commandsEnabled[command.name] === 'undefined') {
            return command._globalEnabled;
        }
        return this._commandsEnabled[command.name];
    }

    /**
     * Sets whether a command group is enabled in the guild.
     * @param {CommandGroupResolvable} group - Command to set status of
     * @param {boolean} enabled - Whether the group should be enabled
     * @return {void}
     */
    setGroupEnabled(group, enabled) {
        group = this.client.registry.resolveGroup(group);
        if (group.guarded) {
            throw new Error('The group is guarded.');
        }
        if (typeof enabled === 'undefined') {
            throw new TypeError('Enabled must not be undefined.');
        }
        enabled = Boolean(enabled);
        if (!this._groupsEnabled) {
            /**
             * Internal map object of group statuses, mapped by group ID
             * @type {Object}
             * @private
             */
            this._groupsEnabled = {};
        }
        this._groupsEnabled[group.id] = enabled;
        /**
         * Emitted whenever a command group is enabled/disabled in a guild
         * @event CommandoClient#groupStatusChange
         * @param {?Guild} guild - Guild that the group was enabled/disabled in (null for global)
         * @param {CommandGroup} group - Group that was enabled/disabled
         * @param {boolean} enabled - Whether the group is enabled
         */
        this.client.emit('groupStatusChange', this, group, enabled);
    }

    /**
     * Checks whether a command group is enabled in the guild.
     * @param {CommandGroupResolvable} group - Group to check status of
     * @return {boolean} True if enabled; false otherwise.
     */
    isGroupEnabled(group) {
        group = this.client.registry.resolveGroup(group);
        if (group.guarded) {
            return true;
        }
        if (!this._groupsEnabled || typeof this._groupsEnabled[group.id] === 'undefined') {
            return group._globalEnabled;
        }
        return this._groupsEnabled[group.id];
    }

    /**
     * Creates a command usage string using the guild's prefix.
     * @param {string} [command] - A command + arg string
     * @param {User} [user=this.client.user] - User to use for the mention command format
     * @return {string} The command usage string
     * @see {@link Command#usage}
     */
    commandUsage(command, user = this.client.user) {
        return Command.usage(command, this.commandPrefix, user);
    }

    /**
     * Sets whether a worker is enabled in the guild.
     * @param {WorkerResolvable} worker - The worker to set the status of
     * @param {boolean} enabled - Whether the worker should be enabled or disabled
     * @return {void}
     */
    setWorkerEnabled(worker, enabled) {
        worker = this.client.registry.resolveWorker(worker);
        if (worker.guarded) {
            throw new Error('The worker is guarded.');
        }
        if (typeof enabled === 'undefined') {
            throw new TypeError('The parameter enabled cannot be undefined');
        }
        enabled = Boolean(enabled);

        if (!this._workersEnabled) {
            /**
             * Map object of internal worker statuses, mapped by worker id.
             * @type {Object}
             * @private
             */
            this._workersEnabled = {};
        }
        this._workersEnabled[worker.id] = enabled;
        /**
         * Emitted whenever a worker is enabled or disabled in a guild.
         * @event CommandoClient#workerStatusChange
         * @param {?Guild} guild - The guild that the command was enabled or disabled in (null for global).
         * @param {Worker} worker - The worker that was enabled or disabled.
         * @param {boolean} enabled - Whether the worker is enabled or disabled.
         */
        this.client.emit('workerStatusChange', this, worker, enabled);
    }

    /**
     * Checks whether a worker is enabled in the guild.
     * @param {WorkerResolvable} worker - The worker to check the status of
     * @return {boolean} True if enabled; false otherwise.
     */
    isWorkerEnabled(worker) {
        worker = this.client.registry.resolveWorker(worker);
        if (worker.guarded) {
            return true;
        }
        if (!this._workersEnabled || typeof this._workersEnabled[worker.id] === 'undefined') {
            return worker.guildEnabledDefault && worker._globalEnabled;
        }
        return this._workersEnabled[worker.id];
    }

    /**
     * Applies the interface to a class prototype.
     * @param {Function} target - The constructor function to apply to the prototype of
     * @return {void}
     * @private
     */
    static applyToClass(target) {
        for (const prop of [
            'commandPrefix',
            'language',
            'settings',
            'setCommandEnabled',
            'isCommandEnabled',
            'setGroupEnabled',
            'isGroupEnabled',
            'setWorkerEnabled',
            'isWorkerEnabled',
            'commandUsage'
        ]) {
            Object.defineProperty(target.prototype, prop, Object.getOwnPropertyDescriptor(this.prototype, prop));
        }
    }
}

module.exports = GuildExtension;
