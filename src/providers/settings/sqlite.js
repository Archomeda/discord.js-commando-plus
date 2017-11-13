/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Renamed SQLiteProvider to SQLiteSettingsProvider
 - Moved some code from SQLiteProvider to SettingsProvider to decrease code duplication
 */

const SettingsProvider = require('./base');

/**
 * Uses an SQLite database to store settings with guilds.
 * @extends {SettingsProvider}
 */
class SQLiteSettingsProvider extends SettingsProvider {
    /**
     * @external SQLiteDatabase
     * @see {@link https://www.npmjs.com/package/sqlite}
     */

    /**
     * @param {SQLiteDatabase} db - Database for the provider
     * @example
     * // Create and use a new SQLite settings provider
     * const sqlite = require('sqlite');
     * client.setSettingsProvider(sqlite.open('database.sqlite3')).then(db => new SQLiteSettingsProvider(db));
     */
    constructor(db) {
        super();

        /**
         * Database that will be used for storing/retrieving settings.
         * @type {SQLiteDatabase}
         */
        this.db = db;

        /**
         * Prepared statement to insert or replace a settings row.
         * @type {SQLiteStatement}
         * @private
         */
        this.insertOrReplaceStmt = null;

        /**
         * Prepared statement to delete an entire settings row.
         * @type {SQLiteStatement}
         * @private
         */
        this.deleteStmt = null;

        /**
         * @external SQLiteStatement
         * @see {@link https://www.npmjs.com/package/sqlite}
         */
    }

    async init(client) {
        await super.init(client);
        await this.db.run('CREATE TABLE IF NOT EXISTS settings (guild INTEGER PRIMARY KEY, settings TEXT)');

        // Load all settings
        const rows = await this.db.all('SELECT CAST(guild as TEXT) as guild, settings FROM settings');
        for (const row of rows) {
            let settings;
            try {
                settings = JSON.parse(row.settings);
            } catch (err) {
                client.emit('warn', `SQLiteProvider couldn't parse the settings stored for guild ${row.guild}.`);
                continue;
            }

            const guild = row.guild !== '0' ? row.guild : 'global';
            this.settings.set(guild, settings);
            if (guild !== 'global' && !client.guilds.has(row.guild)) {
                continue;
            }
            this.setupGuild(guild, settings);
        }

        // Prepare statements
        const statements = await Promise.all([
            this.db.prepare('INSERT OR REPLACE INTO settings VALUES(?, ?)'),
            this.db.prepare('DELETE FROM settings WHERE guild = ?')
        ]);
        this.insertOrReplaceStmt = statements[0];
        this.deleteStmt = statements[1];
    }

    async destroy() {
        // Finalise prepared statements
        await Promise.all([
            this.insertOrReplaceStmt.finalize(),
            this.deleteStmt.finalize()
        ]);
        return super.destroy();
    }

    async set(guild, key, val) {
        guild = this.constructor.getGuildID(guild);
        val = await super.set(guild, key, val);
        await this.insertOrReplaceStmt.run(guild !== 'global' ? guild : 0, JSON.stringify(this.settings.get(guild)));
        return val;
    }

    async remove(guild, key) {
        guild = this.constructor.getGuildID(guild);
        const val = await super.remove(guild, key);
        if (typeof val === 'undefined') {
            return undefined;
        }

        await this.insertOrReplaceStmt.run(guild !== 'global' ? guild : 0, JSON.stringify(this.settings.get(guild)));
        return val;
    }

    async clear(guild) {
        guild = this.constructor.getGuildID(guild);
        if (!this.settings.has(guild)) {
            return;
        }
        await super.clear(guild);
        await this.deleteStmt.run(guild !== 'global' ? guild : 0);
    }
}

module.exports = SQLiteSettingsProvider;
