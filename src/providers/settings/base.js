/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Moved from ./src/providers/base.js to ./src/providers/settings/base.js
 - Renamed SettingProvider to SettingsProvider
 - Moved some code from SQLiteProvider to SettingsProvider to decrease code duplication
 */

/* eslint-disable no-unused-vars, valid-jsdoc */
const Guild = require('discord.js').Guild;

/**
 * Loads and stores settings associated with guilds
 * @abstract
 */
class SettingsProvider {
	constructor() {
		if(this.constructor.name === 'SettingsProvider') {
			throw new Error('The base SettingsProvider cannot be instantiated.');
		}

		/**
		 * Client that the provider is for
		 * (set once the client is ready, after using {@link CommandoClient#setSettingsProvider}).
		 * @name SettingsProvider#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: null, writable: true });

		/**
		 * Settings cached in memory, mapped by guild ID (or 'global')
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
	 * Initialises the provider by connecting to databases and/or caching all data in memory.
	 * {@link CommandoClient#setSettingsProvider} will automatically call this once the client is ready.
	 * @param {CommandoClient} client - Client that will be using the provider
	 * @return {Promise<void>}
	 */
	init(client) {
		this.client = client;
		this.initListeners();
	}

	/**
	 * Initializes the listeners the settings provider should listen to for changes.
	 * @private
	 */
	initListeners() {
		this.listeners
			.set('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
			.set('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd-${command.name}`, enabled))
			.set('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp-${group.id}`, enabled))
			.set('guildCreate', guild => {
				const settings = this.settings.get(guild.id);
				if(!settings) return;
				this.setupGuild(guild.id, settings);
			})
			.set('commandRegister', command => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !this.client.guilds.has(guild)) continue;
					this.setupGuildCommand(this.client.guilds.get(guild), command, settings);
				}
			})
			.set('groupRegister', group => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !this.client.guilds.has(guild)) continue;
					this.setupGuildGroup(this.client.guilds.get(guild), group, settings);
				}
			});
		for(const [event, listener] of this.listeners) this.client.on(event, listener);
	}

	/**
	 * Destroys the provider, removing any event listeners.
	 * @return {Promise<void>}
	 */
	destroy() {
        // Remove all listeners from the client
		for(const [event, listener] of this.listeners) this.client.removeListener(event, listener);
		this.listeners.clear();
	}

	/**
	 * Obtains a setting for a guild
	 * @param {Guild|string} guild - Guild the setting is associated with (or 'global')
	 * @param {string} key - Name of the setting
	 * @param {*} [defVal] - Value to default to if the setting isn't set on the guild
	 * @return {*}
	 */
	get(guild, key, defVal) {
		const settings = this.settings.get(this.constructor.getGuildID(guild));
		return settings ? typeof settings[key] !== 'undefined' ? settings[key] : defVal : defVal;
	}

	/**
	 * Sets a setting for a guild
	 * @param {Guild|string} guild - Guild to associate the setting with (or 'global')
	 * @param {string} key - Name of the setting
	 * @param {*} val - Value of the setting
	 * @return {Promise<*>} New value of the setting
	 */
	set(guild, key, val) {
		guild = this.constructor.getGuildID(guild);
		let settings = this.settings.get(guild);
		if(!settings) {
			settings = {};
			this.settings.set(guild, settings);
		}
		settings[key] = val;
		if(guild === 'global') this.updateOtherShards(key, val);
		return val;
	}

	/**
	 * Removes a setting from a guild
	 * @param {Guild|string} guild - Guild the setting is associated with (or 'global')
	 * @param {string} key - Name of the setting
	 * @return {Promise<*>} Old value of the setting
	 * @abstract
	 */
	remove(guild, key) {
		guild = this.constructor.getGuildID(guild);
		const settings = this.settings.get(guild);
		if(!settings || typeof settings[key] === 'undefined') return undefined;

		const val = settings[key];
		settings[key] = undefined;
		if(guild === 'global') this.updateOtherShards(key, undefined);
		return val;
	}

	/**
	 * Removes all settings in a guild
	 * @param {Guild|string} guild - Guild to clear the settings of
	 * @return {Promise<void>}
	 * @abstract
	 */
	clear(guild) {
		guild = this.constructor.getGuildID(guild);
		if(!this.settings.has(guild)) return;
		this.settings.delete(guild);
	}

	/**
	 * Loads all settings for a guild
	 * @param {string} guild - Guild ID to load the settings of (or 'global')
	 * @param {Object} settings - Settings to load
	 * @private
	 */
	setupGuild(guild, settings) {
		if(typeof guild !== 'string') throw new TypeError('The guild must be a guild ID or "global".');
		guild = this.client.guilds.get(guild) || null;

        // Load the command prefix
		if(typeof settings.prefix !== 'undefined') {
			if(guild) guild._commandPrefix = settings.prefix;
			else this.client._commandPrefix = settings.prefix;
		}

        // Load all command/group statuses
		for(const command of this.client.registry.commands.values()) this.setupGuildCommand(guild, command, settings);
		for(const group of this.client.registry.groups.values()) this.setupGuildGroup(guild, group, settings);
	}

	/**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param {?Guild} guild - Guild to set the status in
	 * @param {Command} command - Command to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
	setupGuildCommand(guild, command, settings) {
		if(typeof settings[`cmd-${command.name}`] === 'undefined') return;
		if(guild) {
			if(!guild._commandsEnabled) guild._commandsEnabled = {};
			guild._commandsEnabled[command.name] = settings[`cmd-${command.name}`];
		} else {
			command._globalEnabled = settings[`cmd-${command.name}`];
		}
	}

	/**
	 * Sets up a group's status in a guild from the guild's settings
	 * @param {?Guild} guild - Guild to set the status in
	 * @param {CommandGroup} group - Group to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
	setupGuildGroup(guild, group, settings) {
		if(typeof settings[`grp-${group.id}`] === 'undefined') return;
		if(guild) {
			if(!guild._groupsEnabled) guild._groupsEnabled = {};
			guild._groupsEnabled[group.id] = settings[`grp-${group.id}`];
		} else {
			group._globalEnabled = settings[`grp-${group.id}`];
		}
	}

	/**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param {string} key - Key of the setting to update
	 * @param {*} val - Value of the setting
	 * @private
	 */
	updateOtherShards(key, val) {
		if(!this.client.shard) return;
		key = JSON.stringify(key);
		val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
		this.client.shard.broadcastEval(`
			if(this.shard.id !== ${this.client.shard.id} && this.settingsProvider && this.settingsProvider.settings) {
				let global = this.settingsProvider.settings.get('global');
				if(!global) {
					global = {};
					this.settingsProvider.settings.set('global', global);
				}
				global[${key}] = ${val};
			}
		`);
	}

	/**
	 * Obtains the ID of the provided guild, or throws an error if it isn't valid
	 * @param {Guild|string} guild - Guild to get the ID of
	 * @return {string} ID of the guild, or 'global'
	 */
	static getGuildID(guild) {
		if(guild instanceof Guild) return guild.id;
		if(guild === 'global' || guild === null) return 'global';
		if(typeof guild === 'string' && !isNaN(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}

module.exports = SettingsProvider;
