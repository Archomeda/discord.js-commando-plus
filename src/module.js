/*
 Original author: Archomeda
 */

const Command = require('commands/base');
const LocaleHelper = require('./providers/locale/helper');

/**
 * A module can contain commands, command groups, workers and localizations that can be registered to a client in one
 * go. This makes it easy to write third-party extensions for Commando-Plus with a common structure.
 */
class Module {
    /**
     * @typedef {Object} ModuleInfo
     * @property {string} namespace - The namespace of the module (must be lowercase)
     * @property {Command[]} commands - The commands associated with this module
     * @property {Command[]} groups - The groups associated with this module
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
         * @name Command#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The namespace of this module.
         * @type {string}
         */
        this.namespace = info.namespace;

        /**
         * The commands associated with this module.
         * @type {Command[]}
         */
        this.commands = info.commands;

        /**
         * The groups associated with this module.
         * @type {CommandGroup[]|Function[]|Array<string[]>}
         */
        this.groups = info.groups;

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
        if (typeof info.namespace !== 'string') {
            throw new TypeError('Module namespace must be a string.');
        }
        if (info.namespace !== info.namespace.toLowerCase()) {
            throw new Error('Module namespace must be lowercase.');
        }
        if (info.commands && (!Array.isArray(info.commands) || info.commands.some(c => !(c instanceof Command)))) {
            throw new TypeError('Module commands must be an Array of Commands.');
        }
        if (typeof info.localizationDirectory !== 'string') {
            throw new TypeError('Module localization directory must be a string.');
        }
    }
}

module.exports = Module;
