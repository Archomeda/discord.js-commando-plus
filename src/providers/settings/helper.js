/**
 * Helper class to use {@link SettingsProvider} methods for a specific Guild.
 */
class GuildSettingsHelper {
    /**
     * @param {CommandoClient} client - Client to use the provider of
     * @param {?Guild} guild - Guild the settings are for
     * @private
     */
    constructor(client, guild) {
        /**
         * Client to use the provider of.
         * @name GuildSettingsHelper#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * Guild the settings are for.
         * @type {?Guild}
         */
        this.guild = guild;
    }

    /**
     * Gets a setting in the guild.
     * @param {string} key - Name of the setting
     * @param {*} [defVal] - Value to default to if the setting isn't set
     * @return {*} The value of the setting.
     * @see {@link SettingsProvider#get}
     */
    get(key, defVal) {
        if (!this.client.settingsProvider) {
            throw new Error('No settings provider is available.');
        }
        return this.client.settingsProvider.get(this.guild, key, defVal);
    }

    /**
     * Gets whether a setting exists for a guild.
     * @param {string} key - Name of the setting
     * @return {boolean} True if the setting exists, false otherwise.
     * @see {@link SettingsProvider#has}
     */
    has(key) {
        if (!this.client.settingsProvider) {
            throw new Error('No settings provider is available.');
        }
        return this.client.settingsProvider.has(this.guild, key);
    }

    /**
     * Sets a setting for the guild.
     * @param {string} key - Name of the setting
     * @param {*} val - Value of the setting
     * @return {Promise<*>} New value of the setting.
     * @see {@link SettingsProvider#set}
     */
    set(key, val) {
        if (!this.client.settingsProvider) {
            throw new Error('No settings provider is available.');
        }
        return this.client.settingsProvider.set(this.guild, key, val);
    }

    /**
     * Removes a setting from the guild.
     * @param {string} key - Name of the setting
     * @return {Promise<*>} Old value of the setting.
     * @see {@link SettingsProvider#remove}
     */
    remove(key) {
        if (!this.client.settingsProvider) {
            throw new Error('No settings provider is available.');
        }
        return this.client.settingsProvider.remove(this.guild, key);
    }

    /**
     * Removes all settings in the guild.
     * @return {Promise<void>} The promise.
     * @see {@link SettingsProvider#clear}
     */
    clear() {
        if (!this.client.settingsProvider) {
            throw new Error('No settings provider is available.');
        }
        return this.client.settingsProvider.clear(this.guild);
    }
}

module.exports = GuildSettingsHelper;
