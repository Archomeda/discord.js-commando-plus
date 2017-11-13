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
     * @param {string} directory - The path to the directory where the YAML setting files are stored
     * @example
     * // Create and use a new YAML settings provider
     * client.setSettingsProvider(new YAMLSettingsProvider('path/to/config/directory'));
     */
    constructor(directory) {
        super();

        /**
         * The absolute path to the directory where the YAML setting files are stored.
         * @name YAMLSettingsProvider#directory
         * @type {string}
         * @readonly
         */
        Object.defineProperty(this, 'directory', { value: path.resolve(directory) });
    }

    async init(client) {
        await super.init(client);

        // Load all settings
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory);
        }
        const files = (await readdirAsync(this.directory))
            .filter(p => path.extname(p) === '.yml')
            .map(p => path.join(this.directory, p));

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
        await writeFileAsync(path.join(this.directory, `${guild}.yml`), yaml.safeDump(this.settings.get(guild)));
        return val;
    }

    async remove(guild, key) {
        guild = this.constructor.getGuildID(guild);
        const val = await super.remove(guild, key);
        if (typeof val === 'undefined') {
            return undefined;
        }

        await writeFileAsync(path.join(this.directory, `${guild}.yml`), yaml.safeDump(this.settings.get(guild)));
        return val;
    }

    async clear(guild) {
        guild = this.constructor.getGuildID(guild);
        if (!this.settings.has(guild)) {
            return;
        }
        await super.clear(guild);
        await unlinkAsync(path.join(this.directory, `${guild}.yaml`));
    }
}

module.exports = YAMLSettingsProvider;
