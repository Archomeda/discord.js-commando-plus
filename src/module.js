/*
 Original author: Archomeda
 */

const discord = require('discord.js');
const Command = require('./commands/base');
const LocaleHelper = require('./providers/locale/helper');
const Worker = require('./workers/base');

/**
 * A module can contain commands, command groups, workers and localizations that can be registered to a client in one
 * go. This makes it easy to write third-party extensions for Commando-Plus with a common structure.
 */
class Module {
    /**
     * @typedef {Object} ModuleInfo
     * @property {string} id - The id of the module (must be lowercase)
     * @property {Command[]} commands - The commands associated with this module
     * @property {CommandGroup[]|Function[]|Array<string[]>|string[]} groups - The groups associated with this module
     * @property {string} commandsDirectory - Fully resolved path to the module's commands directory
     * @property {Worker[]} workers - The workers associated with this module
     * @property {string} workersDirectory - Fully resolved path to the module's workers directory
     * @property {string} localizationDirectory - The directory that contains the localizations for this module.
     * The directory must contain language culture name subdirectories, e.g. en-US.
     * Inside those directories you can create JSON translation files.
     */

    /**
     * @param {CommandoClient} client - The client the command is for
     * @param {ModuleInfo} info - The command information
     */
    constructor(client, info) {
        this.constructor.validateInfo(client, info);

        /**
         * The client that this module is for.
         * @name Module#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The id of this module.
         * @type {string}
         */
        this.id = info.id;

        /**
         * The commands associated with this module.
         * @type {Map<string, Command>}
         */
        this.commands = new discord.Collection();

        if (info.commands) {
            for (const command of info.commands) {
                command.module = this;
                this.commands.set(command.name, command);
            }
        }

        /**
         * The groups associated with this module.
         * @type {CommandGroup[]|Function[]|Array<string[]>|string[]}
         */
        this.groups = info.groups;

        /**
         * Fully resolved path to the module's commands directory.
         * @type {string}
         */
        this.commandsDirectory = info.commandsDirectory;

        /**
         * The workers associated with this module.
         * @type {Map<string, Worker>}
         */
        this.workers = new discord.Collection();

        if (info.workers) {
            for (const worker of info.workers) {
                worker.module = this;
                this.workers.set(worker.id, worker);
            }
        }

        /**
         * Fully resolved path to the module's workers directory.
         * @type {string}
         */
        this.workersDirectory = info.workersDirectory;

        /**
         * The directory where the localizations for this module can be found.
         * @type {string}
         */
        this.localizationDirectory = info.localizationDirectory;

        /**
         * Shortcut to use locale provider methods for the module locales.
         * @type {LocaleHelper}
         */
        this.localization = new LocaleHelper(client, this);
    }

    /**
     * Validates the constructor parameters.
     * @param {CommandoClient} client - Client to validate
     * @param {ModuleInfo} info - Info to validate
     * @return {void}
     * @private
     */
    static validateInfo(client, info) {
        if (!client) {
            throw new Error('A client must be specified.');
        }
        if (typeof info !== 'object') {
            throw new TypeError('Module info must be an Object.');
        }
        if (typeof info.id !== 'string') {
            throw new TypeError('Module id must be a string.');
        }
        if (info.id !== info.id.toLowerCase()) {
            throw new Error('Module id must be lowercase.');
        }
        if (info.commands && (!Array.isArray(info.commands) || info.commands.some(c => !(c instanceof Command)))) {
            throw new TypeError('Module commands must be an Array of Commands.');
        }
        if (info.commandsDirectory && typeof info.commandsDirectory !== 'string') {
            throw new TypeError('Module commands directory must be a string.');
        }
        if (info.workers && (!Array.isArray(info.workers) || info.workers.some(w => !(w instanceof Worker)))) {
            throw new TypeError('Module workers must be an Array of Workers.');
        }
        if (info.workersDirectory && typeof info.workersDirectory !== 'string') {
            throw new TypeError('Module workers directory must be a string.');
        }
        if (typeof info.localizationDirectory !== 'string') {
            throw new TypeError('Module localization directory must be a string.');
        }
    }
}

module.exports = Module;
