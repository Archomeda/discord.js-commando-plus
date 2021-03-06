/*
 Original author: Archomeda
 */

/**
 * Helper class to use {@link LocaleProvider} methods for a specific module (or client).
 */
class LocaleHelper {
    /**
     * @param {CommandoClient} client - The client that is used for this helper
     * @param {?Module} module - The module that is used for this helper
     * @private
     */
    constructor(client, module) {
        /**
         * The client that is used for this helper.
         * @name LocaleHelper#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The module that is used for this helper, if associated with one.
         * @name LocaleHelper#module
         * @type {Module}
         * @readonly
         */
        Object.defineProperty(this, 'module', { value: module });
    }

    /**
     * Gets the translation of a key.
     * @param {string} namespace - The namespace
     * @param {string} key - The key
     * @param {GuildResolvable} [guild] - The guild
     * @param {Object} [vars] - Extra variables for the translator
     * @return {string} The translation.
     */
    translate(namespace, key, guild, vars) {
        if (guild) {
            guild = this.client.resolver.resolveGuild(guild);
        }
        return this.client.localeProvider.translate(
            this.module ? this.module.id : null,
            namespace,
            key,
            guild && guild.language ? guild.language : this.client.language,
            vars
        );
    }

    /**
     * Alias of {@link LocaleProvider#translate}.
     * @param {string} namespace - The namespace
     * @param {string} key - The key
     * @param {GuildResolvable} [guild] - The guild
     * @param {Object} [vars] - Extra variables for the translator
     * @return {string} The translation.
     */
    tl(namespace, key, guild, vars) {
        return this.translate(namespace, key, guild, vars);
    }
}

module.exports = LocaleHelper;
