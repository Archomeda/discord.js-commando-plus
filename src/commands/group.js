/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added GroupInfo
 - Added GroupInfo.module
 - Changed the constructor to take GroupInfo
 */

const discord = require('discord.js');

/**
 * A group for commands. Whodathunkit?
 */
class CommandGroup {
    /**
     * @typedef {Object} GroupInfo
     * @param {string} id - The ID for the group
     * @property {string} [name=id] - The localization key that will be used to get the name of the module. Defaults to
     * `<id>`.
     * @property {string} module - The ID of the module the command belongs to (must be lowercase)
     * @param {Command[]} [commands] - The commands that the group contains
     * @property {boolean} [guarded=false] - Whether the command should be protected from disabling
     */

    /**
     * @param {CommandoClient} client - The client the group is for
     * @param {GroupInfo} info - The group information
     */
    constructor(client, info) {
        this.constructor.validateInfo(client, info);

        /**
         * Client that this group is for.
         * @name CommandGroup#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * ID of this group.
         * @type {string}
         */
        this.id = info.id;

        /**
         * Locale key for the name of this group.
         * @type {string}
         */
        this.name = info.name || info.id;

        /**
         * ID of the module the group initially belongs to.
         * @type {string}
         */
        this.moduleID = info.module;

        /**
         * The module the group initially belongs to, assigned upon registration through a module.
         * @type {?Module}
         */
        this.module = null;

        /**
         * The commands in this group (added upon their registration).
         * @type {Collection<string, Command>}
         */
        this.commands = new discord.Collection();
        if (info.commands) {
            for (const command of info.commands) {
                this.commands.set(command.name, command);
            }
        }

        /**
         * Whether or not this group is protected from being disabled.
         * @type {boolean}
         */
        this.guarded = info.guarded;

        this._globalEnabled = true;
    }

    /**
     * Enables or disables the group in a guild
     * @param {?GuildResolvable} guild - Guild to enable/disable the group in
     * @param {boolean} enabled - Whether the group should be enabled or disabled
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
            throw new Error('The group is guarded.');
        }
        if (!guild) {
            this._globalEnabled = enabled;
            this.client.emit('groupStatusChange', null, this, enabled);
            return;
        }
        guild = this.client.resolver.resolveGuild(guild);
        guild.setGroupEnabled(this, enabled);
    }

    /**
     * Checks if the group is enabled in a guild.
     * @param {?GuildResolvable} guild - Guild to check in
     * @return {boolean} Whether or not the group is enabled
     */
    isEnabledIn(guild) {
        if (this.guarded) {
            return true;
        }
        if (!guild) {
            return this._globalEnabled;
        }
        guild = this.client.resolver.resolveGuild(guild);
        return guild.isGroupEnabled(this);
    }

    /**
     * Reloads all of the group's commands.
     * @return {void}
     */
    reload() {
        for (const command of this.commands.values()) {
            command.reload();
        }
    }

    /**
     * Validates the constructor parameters.
     * @param {CommandoClient} client - Client to validate
     * @param {GroupInfo} info - Info to validate
     * @return {void}
     * @private
     */
    static validateInfo(client, info) { // eslint-disable-line complexity
        if (!client) {
            throw new Error('A client must be specified.');
        }
        if (typeof info !== 'object') {
            throw new TypeError('Group info must be an Object.');
        }
        if (typeof info.id !== 'string') {
            throw new TypeError('Group ID must be a string.');
        }
        if (info.id !== info.id.toLowerCase()) {
            throw new Error('Group ID must be lowercase.');
        }
        if ('name' in info && typeof info.name !== 'string') {
            throw new TypeError('Group name must be a string.');
        }
        if (typeof info.module !== 'string') {
            throw new TypeError('Group module must be a string.');
        }
        if (info.module !== info.module.toLowerCase()) {
            throw new Error('Group module must be lowercase.');
        }
        if (info.commands && !Array.isArray(info.commands)) {
            throw new TypeError('Group commands must be an Array of Commands.');
        }
    }
}

module.exports = CommandGroup;
