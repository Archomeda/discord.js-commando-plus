/*
 Original author: Archomeda
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const yaml = require('js-yaml');
const SettingsProvider = require('./base');

const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);


/**
 * Uses local YAML files to store guild settings.
 * @extends {SettingsProvider}
 */
class YAMLSettingsProvider extends SettingsProvider {
    /**
     * @param {string} folder - The path to the folder where the YAML setting files are stored
     */
    constructor(folder) {
        super();

        /**
         * The absolute path to the folder where the YAML setting files are stored.
         * @name YAMLSettingsProvider#path
         * @type {string}
         * @readonly
         */
        Object.defineProperty(this, 'folder', { value: path.resolve(folder) });
    }

    async init(client) {
        await super.init(client);

        // Load all settings
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder);
        }
        const files = (await readdirAsync(this.folder))
            .filter(p => path.extname(p) === '.yml')
            .map(p => path.join(this.folder, p));

        this.settings = new Map(await Promise.all(files.map(async p => {
            const guild = path.basename(p, '.yml');
            let data = {};
            try {
                data = yaml.safeLoad(await readFileAsync(p));
                if (guild === 'global' || client.guilds.has(guild)) {
                    this.setupGuild(guild, data);
                }
            } catch (err) {
                client.emit(
                    'warn',
                    `YamlSettingsProvider couldn't parse the settings stored for guild ${guild}: ${err.message}`
                );
            }
            return [guild, data];
        })));
        client.emit('debug', `Loaded ${files.length} guild settings files`);
    }

    async set(guild, key, val) {
        guild = this.constructor.getGuildID(guild);
        val = await super.set(guild, key, val);
        await writeFileAsync(path.join(this.folder, `${guild}.yml`), yaml.safeDump(this.settings.get(guild)));
        return val;
    }

    async remove(guild, key) {
        guild = this.constructor.getGuildID(guild);
        const val = await super.remove(guild, key);
        if (typeof val === 'undefined') {
            return undefined;
        }

        await writeFileAsync(path.join(this.folder, `${guild}.yml`), yaml.safeDump(this.settings.get(guild)));
        return val;
    }

    async clear(guild) {
        guild = this.constructor.getGuildID(guild);
        if (!this.settings.has(guild)) {
            return;
        }
        await super.clear(guild);
        await unlinkAsync(path.join(this.folder, `${guild}.yaml`));
    }
}

module.exports = YAMLSettingsProvider;
