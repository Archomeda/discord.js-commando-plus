/*
 Original author: Archomeda
 */

/**
 * Helper class to use {@link LocaleProvider} methods for a specific worker.
 * The localization file is stored in the specified module localizations folder as `<module_id>.json`.
 * The worker localizations are stored inside the property `<worker_id>`.
 */
class WorkerLocaleHelper {
    /**
     * @param {CommandoClient} client - The client that is used for this helper
     * @param {?Worker} worker - The worker that is used for this helper
     * @private
     */
    constructor(client, worker) {
        /**
         * The client that is used for this helper.
         * @name WorkerLocaleHelper#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The worker that is used for this helper, if associated with one.
         * @name WorkerLocaleHelper#worker
         * @type {Worker}
         * @readonly
         */
        Object.defineProperty(this, 'worker', { value: worker });
    }

    /**
     * Gets the translation of a key.
     * @param {string} key - The key
     * @param {GuildResolvable} [guild] - The guild
     * @param {Object} [vars] - Extra variables for the translator
     * @return {string} The translation.
     */
    translate(key, guild, vars) {
        if (guild) {
            guild = this.client.resolver.resolveGuild(guild);
        }
        return this.client.localeProvider.translate(
            this.worker.moduleID,
            this.worker.moduleID,
            `${this.worker.id}.${key}`,
            guild && guild.language ? guild.language : this.client.language,
            vars
        );
    }

    /**
     * Alias of {@link LocaleProvider#translate}.
     * @param {string} key - The key
     * @param {GuildResolvable} [guild] - The guild
     * @param {Object} [vars] - Extra variables for the translator
     * @return {string} The translation.
     */
    tl(key, guild, vars) {
        return this.translate(key, guild, vars);
    }
}

module.exports = WorkerLocaleHelper;
