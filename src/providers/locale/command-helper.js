/*
 Original author: Archomeda
 */

/**
 * Helper class to use {@link LocaleProvider} methods for a specific command or worker.
 */
class CommandLocaleHelper {
    /**
     * @param {CommandoClient} client - The client that is used for this helper
     * @param {?Command} command - The command that is used for this helper
     * @private
     */
    constructor(client, command) {
        /**
         * The client that is used for this helper.
         * @name CommandLocaleHelper#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The command that is used for this helper, if associated with one.
         * @name CommandLocaleHelper#command
         * @type {Command}
         * @readonly
         */
        Object.defineProperty(this, 'command', { value: command });
    }

    /**
     * Gets the translation of a key.
     * @param {string} key - The key
     * @param {GuildResolvable} [guild] - The guild
     * @param {Object} [vars] - Extra variables for the translator
     * @return {string} The translation.
     * @abstract
     */
    translate(key, guild, vars) {
        if (guild) {
            guild = this.client.resolver.resolveGuild(guild);
        }
        return this.client.localeProvider.translate(
            this.command.moduleID,
            this.command.groupID,
            `${this.command.name}.${key}`,
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

module.exports = CommandLocaleHelper;
