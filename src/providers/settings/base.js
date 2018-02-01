/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Moved from ./src/providers/base.js to ./src/providers/settings/base.js
 - Renamed SettingProvider to SettingsProvider
 - Moved some code from SQLiteProvider to SettingsProvider to decrease code duplication
 - Added SettingsProvider.setupGuildWorker()
 - Changed SettingsProvider.initListeners()
 - Changed SettingsProvider.get()
 - Changed SettingsProvider.set()
 - Changed SettingsProvider.setupGuild()
 */

const objectPath = require('object-path');

const { Guild } = require('discord.js');

/**
 * Loads and stores settings associated with guilds.
 * @abstract
 */
class SettingsProvider {
    constructor() {
        if (this.constructor.name === 'SettingsProvider') {
            throw new Error('The base SettingsProvider cannot be instantiated.');
        }

        /**
         * The associated client with this provider
         * (set once the client is ready, after using {@link CommandoClient#setSettingsProvider}).
         * @name SettingsProvider#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: null, writable: true });

        /**
         * Settings cached in memory, mapped by guild ID (or 'global').
         * @type {Map}
         * @private
         */
        this.settings = new Map();

        /**
         * Listeners on the Client, mapped by the event name.
         * @type {Map}
         * @private
         */
        this.listeners = new Map();
    }

    /**
     * Initializes the provider by connecting to databases and/or caching all data in memory.
     * {@link CommandoClient#setSettingsProvider} will automatically call this once the client is ready.
     * @param {CommandoClient} client - Client that will be using the provider
     * @return {Promise<void>} The promise.
     */
    init(client) {
        this.client = client;
        this.initListeners();
    }

    /**
     * Initializes the listeners the settings provider should listen to for changes.
     * @return {void}
     * @private
     */
    initListeners() {
        this.listeners
            .set('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
            .set('languageChange', (guild, language) => this.set(guild, 'language', language))
            .set('defaultActivityChange', (type, game, url) => this.set('global', 'activity', { type, game, url }))
            .set('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd-${command.name}`, enabled))
            .set('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp-${group.id}`, enabled))
            .set('workerStatusChange', (guild, worker, enabled) => this.set(guild, `wkr-${worker.id}`, enabled))
            .set('guildCreate', guild => {
                const settings = this.settings.get(guild.id);
                if (!settings) {
                    return;
                }
                this.setupGuild(guild.id, settings);
            })
            .set('commandRegister', command => {
                for (const [guild, settings] of this.settings) {
                    if (guild !== 'global' && !this.client.guilds.has(guild)) {
                        continue;
                    }
                    this.setupGuildCommand(this.client.guilds.get(guild), command, settings);
                }
            })
            .set('groupRegister', group => {
                for (const [guild, settings] of this.settings) {
                    if (guild !== 'global' && !this.client.guilds.has(guild)) {
                        continue;
                    }
                    this.setupGuildGroup(this.client.guilds.get(guild), group, settings);
                }
            })
            .set('workerRegister', async worker => {
                for (const [guild, settings] of this.settings) {
                    if (guild !== 'global' && !this.client.guilds.has(guild)) {
                        continue;
                    }
                    // eslint-disable-next-line no-await-in-loop
                    await this.setupGuildWorker(this.client.guilds.get(guild), worker, settings);
                }
            });
        for (const [event, listener] of this.listeners) {
            this.client.on(event, listener);
        }
    }

    /**
     * Destroys the provider, removing any event listeners.
     * @return {Promise<void>} The promise.
     */
    destroy() {
        // Remove all listeners from the client
        for (const [event, listener] of this.listeners) {
            this.client.removeListener(event, listener);
        }
        this.listeners.clear();
    }

    /**
     * Obtains a setting for a guild.
     * @param {Guild|string} guild - Guild the setting is associated with (or 'global')
     * @param {string} key - Name of the setting
     * @param {*} [defVal] - Value to default to if the setting isn't set on the guild
     * @return {*} The value of the setting.
     */
    get(guild, key, defVal) {
        const settings = this.settings.get(this.constructor.getGuildID(guild));
        return settings && objectPath.has(settings, key) ? objectPath.get(settings, key) : defVal;
    }

    /**
     * Sets a setting for a guild.
     * @param {Guild|string} guild - Guild to associate the setting with (or 'global')
     * @param {string} key - Name of the setting
     * @param {*} val - Value of the setting
     * @return {Promise<*>} The new value of the setting.
     */
    set(guild, key, val) {
        guild = this.constructor.getGuildID(guild);
        let settings = this.settings.get(guild);
        if (!settings) {
            settings = {};
            this.settings.set(guild, settings);
        }
        objectPath.set(settings, key, val);
        if (guild === 'global') {
            this.updateOtherShards(key, val);
        }
        return val;
    }

    /**
     * Removes a setting from a guild.
     * @param {Guild|string} guild - Guild the setting is associated with (or 'global')
     * @param {string} key - Name of the setting
     * @return {Promise<*>} The old value of the setting.
     */
    remove(guild, key) {
        guild = this.constructor.getGuildID(guild);
        const settings = this.settings.get(guild);
        if (!settings || !objectPath.has(settings, key)) {
            return undefined;
        }
        const val = objectPath.get(settings, key);
        objectPath.del(settings, key);
        if (guild === 'global') {
            this.updateOtherShards(key, undefined);
        }
        return val;
    }

    /**
     * Removes all settings in a guild.
     * @param {Guild|string} guild - Guild to clear the settings of
     * @return {Promise<void>} The promise.
     */
    clear(guild) {
        guild = this.constructor.getGuildID(guild);
        if (!this.settings.has(guild)) {
            return;
        }
        this.settings.delete(guild);
    }

    /**
     * Loads all settings for a guild.
     * @param {string} guild - Guild ID to load the settings of (or 'global')
     * @param {Object} settings - Settings to load
     * @return {Promise<void>} The promise.
     * @private
     */
    async setupGuild(guild, settings) {
        if (typeof guild !== 'string') {
            throw new TypeError('The guild must be a guild ID or "global".');
        }
        guild = this.client.guilds.get(guild) || null;

        // Load the command prefix
        if (typeof settings.prefix !== 'undefined') {
            if (guild) {
                guild._commandPrefix = settings.prefix;
            } else {
                this.client._commandPrefix = settings.prefix;
            }
        }

        // Load the language
        if (typeof settings.language !== 'undefined') {
            if (guild) {
                guild._language = settings.language;
            } else {
                this.client._language = settings.language;
            }
        }

        // Load the activity
        if (!guild && typeof settings.activity !== 'undefined' && settings.activity.type !== 'NONE') {
            const options = { type: settings.activity.type };
            if (settings.activity.url) {
                options.url = settings.activity.url;
            }
            await this.client.user.setActivity(settings.activity.game, options);
        }

        // Load all command, group and worker statuses
        for (const command of this.client.registry.commands.values()) {
            this.setupGuildCommand(guild, command, settings);
        }
        for (const group of this.client.registry.groups.values()) {
            this.setupGuildGroup(guild, group, settings);
        }
        for (const worker of this.client.registry.workers.values()) {
            await this.setupGuildWorker(guild, worker, settings); // eslint-disable-line no-await-in-loop
        }
    }

    /**
     * Sets up a command's status in a guild from the guild's settings.
     * @param {?Guild} guild - Guild to set the status in
     * @param {Command} command - Command to set the status of
     * @param {Object} settings - Settings of the guild
     * @return {void}
     * @private
     */
    setupGuildCommand(guild, command, settings) {
        if (typeof settings[`cmd-${command.name}`] === 'undefined') {
            return;
        }
        if (guild) {
            if (!guild._commandsEnabled) {
                guild._commandsEnabled = {};
            }
            guild._commandsEnabled[command.name] = settings[`cmd-${command.name}`];
        } else {
            command._globalEnabled = settings[`cmd-${command.name}`];
        }
    }

    /**
     * Sets up a group's status in a guild from the guild's settings.
     * @param {?Guild} guild - Guild to set the status in
     * @param {CommandGroup} group - Group to set the status of
     * @param {Object} settings - Settings of the guild
     * @return {void}
     * @private
     */
    setupGuildGroup(guild, group, settings) {
        if (typeof settings[`grp-${group.id}`] === 'undefined') {
            return;
        }
        if (guild) {
            if (!guild._groupsEnabled) {
                guild._groupsEnabled = {};
            }
            guild._groupsEnabled[group.id] = settings[`grp-${group.id}`];
        } else {
            group._globalEnabled = settings[`grp-${group.id}`];
        }
    }

    /**
     * Sets up a worker's status in a guild from the guild's settings.
     * @param {?Guild} guild - Guild to set the status in
     * @param {Worker} worker - Worker to set the status of
     * @param {Object} settings - Settings of the guild
     * @return {Promise<void>} The promise.
     * @private
     */
    async setupGuildWorker(guild, worker, settings) {
        if (typeof settings[`wkr-${worker.id}`] === 'undefined') {
            return;
        }
        if (guild) {
            if (!guild._workersEnabled) {
                guild._workersEnabled = {};
            }
            guild._workersEnabled[worker.id] = settings[`wkr-${worker.id}`];
        } else {
            // Start the worker here initially here because we currently have no better place for it
            worker._globalEnabled = worker.globalEnabledDefault;
            if (typeof settings[`wkr-${worker.id}`] !== 'undefined') {
                worker._globalEnabled = settings[`wkr-${worker.id}`];
            }
            if (worker._globalEnabled) {
                await worker.start();
            }
        }
    }

    /**
     * Updates a global setting on all other shards if using the {@link ShardingManager}.
     * @param {string} key - Key of the setting to update
     * @param {*} val - Value of the setting
     * @return {void}
     * @private
     */
    updateOtherShards(key, val) {
        if (!this.client.shard) {
            return;
        }
        key = JSON.stringify(key);
        val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
        /* eslint-disable indent */
        this.client.shard.broadcastEval(`
            if (this.shard.id !== ${this.client.shard.id} && this.settingsProvider && this.settingsProvider.settings) {
                const objectPath = require('object-path'); // Untested, but hey maybe it works
                let global = this.settingsProvider.settings.get('global');
                if (!global) {
                    global = {};
                    this.settingsProvider.settings.set('global', global);
                }
                ${typeof val !== 'undefined' ?
                    `objectPath.set(global, ${key}, ${val});` :
                    `objectPath.del(global, ${key}`
                }
            }
		`);
        /* eslint-enable indent */
    }

    /**
     * Obtains the ID of the provided guild, or throws an error if it isn't valid.
     * @param {Guild|string} guild - Guild to get the ID of
     * @return {string} ID of the guild, or 'global'.
     */
    static getGuildID(guild) {
        if (guild instanceof Guild) {
            return guild.id;
        }
        if (guild === 'global' || guild === null) {
            return 'global';
        }
        if (typeof guild === 'string' && !isNaN(guild)) {
            return guild;
        }
        throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
    }
}

module.exports = SettingsProvider;
