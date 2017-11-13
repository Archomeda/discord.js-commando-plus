/*
 Original author: Archomeda
 */

const path = require('path');
const { promisify } = require('util');
const LocaleProvider = require('./base');
const FileBackend = require('./i18next-file-backend');

/**
 * Handles localization via i18next.
 * @extends {LocaleProvider}
 */
class I18nextLocaleProvider extends LocaleProvider {
    /**
     * @external i18next
     * @see {@link https://www.npmjs.com/package/i18next}
     */

    /**
     * @param {i18next} i18next - The i18next instance
     * @param {string} language - The language
     * @param {string} directory - The path to the parent directory where the extra localizations are located
     * that override the default localizations
     * @example
     * // Create and use a new i18next locale provider
     * const i18next = require('i18next');
     * client.setLocaleProvider(new I18nextLocaleProvider(i18next, 'en-US', 'path/to/localization/directory'));
     */
    constructor(i18next, language, directory) {
        super();

        /**
         * The i18next instance that is used for localization.
         * @name I18nextLocaleProvider#localizer
         * @type {i18next}
         * @readonly
         */
        Object.defineProperty(this, 'localizer', { value: i18next });
        this.localizer.loadNamespacesAsync = promisify(this.localizer.loadNamespaces);

        /**
         * The active language.
         * @type {string}
         */
        this.language = language;

        /**
         * The path to the parent directory where the extra localizations are located.
         * @type {string}
         * @readonly
         */
        this.directory = path.resolve(directory);
    }

    async init(client) {
        await super.init(client);

        this.localizer.on('failedLoading', (lng, ns, msg) =>
            this.client.emit('warn', `Failed to load localization namespace '${ns}' for ${lng}: ${msg}`));
        this.localizer.on('onMissingKey', (lng, ns, key) =>
            this.client.emit('warn', `Missing translation for '${key}' in localization namespace '${ns}' for ${lng}`));
        this.localizer.use(FileBackend).init({
            lng: this.language,
            fallbackLng: 'en-US',
            ns: ['common', 'errors'],
            defaultNS: 'common',
            load: 'currentOnly',
            backend: {
                loadPath: [
                    path.resolve(path.join(this.directory, 'locales', '{{lng}}', '{{ns}}.json')),
                    path.resolve(path.join(__dirname, '..', 'locales', '{{lng}}', '{{ns}}.json'))
                ]
            },
            interpolation: { escape: s => s }
        });
    }

    preloadNamespaces(namespaces) {
        return this.localizer.loadNamespacesAsync(namespaces);
    }

    translate(namespace, key, vars) {
        return this.localizer.t(`${namespace ? `${namespace}:` : ''}${key}`, vars);
    }
}

module.exports = I18nextLocaleProvider;
