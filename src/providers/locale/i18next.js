/*
 Original author: Archomeda
 */

const path = require('path');
const LocaleProvider = require('./base');
const Backend = require('./i18next-commando-plus-backend');

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
     * @param {string} [directory] - The path to the directory where the extra localizations are located that override
     * the default localizations
     * @param {Object} [options] - Additional i18next options to pass to the initializer
     * @example
     * // Create and use a new i18next locale provider
     * const i18next = require('i18next');
     * client.setLocaleProvider(new I18nextLocaleProvider(i18next, 'path/to/localization/overrides'));
     */
    constructor(i18next, directory, options) {
        super();

        /**
         * The i18next instance that is used for localization.
         * @name I18nextLocaleProvider#localizer
         * @type {i18next}
         * @readonly
         */
        Object.defineProperty(this, 'localizer', { value: i18next });

        /**
         * The path to the directory where the override localizations are located.
         * @type {string}
         * @readonly
         */
        this.directory = directory ? path.resolve(directory) : null;

        /**
         * The additional options for the i18next initializer.
         * @type {Object}
         */
        this.options = options;
    }

    async init(client) {
        await super.init(client);

        this.localizer.on('failedLoading', (lng, ns, msg) =>
            this.client.emit('warn', `Failed to load localization namespace '${ns}' for ${lng}: ${msg}`));
        this.localizer.on('onMissingKey', (lng, ns, key) =>
            this.client.emit('warn', `Missing translation for '${key}' in localization namespace '${ns}' for ${lng}`));

        this.localizer.use(Backend).init({
            lng: client.language,
            fallbackLng: 'en-US',
            ns: ['common', 'errors', 'validation', 'glossary'],
            defaultNS: 'common',
            backend: {
                globalPath: path.resolve(path.join(__dirname, '../../locales//{{lng}}/{{ns}}.json')),
                overridePath: this.directory ? path.resolve(path.join(this.directory, '{{lng}}/{{ns}}.json')) : null,
                getModulePath: namespace => {
                    const module = client.registry.modules.get(namespace);
                    return module ? path.resolve(path.join(module.localizationDirectory, '{{lng}}/{{ns}}.json')) : null;
                }
            },
            interpolation: { escape: s => s },
            ...this.options
        });

        await this.localizer.loadLanguages(['nl-NL']);
    }

    preloadNamespaces(namespaces) {
        try {
            return this.localizer.loadNamespaces(namespaces);
        } catch (err) {
            // Consume error
        }
        return undefined;
    }

    translate(module, namespace, key, lang, vars) {
        // Make sure we preload our namespace
        this.preloadNamespace(`${module ? `${module}#` : ''}${namespace}`, lang);
        return this.localizer.t(`${module ? `${module}#` : ''}${namespace ? `${namespace}:` : ''}${key}`, {
            ...vars,
            lng: lang
        });
    }
}

module.exports = I18nextLocaleProvider;
