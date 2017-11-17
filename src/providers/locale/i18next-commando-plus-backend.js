/*
 Original author: Archomeda
 */

const fs = require('fs');
const merge = require('deepmerge');

function getDefaults() {
    return {
        globalPath: '/locales/{{lng}}/{{ns}}.json',
        overridePath: null,
        moduleSeparator: '#',
        getModulePath: () => undefined
    };
}

function readLocaleFile(fileName, callback) {
    fs.readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
            err.message = `error parsing ${fileName}: ${err.message}`;
            return callback(err);
        }
        data = data.replace(/^\uFEFF/, '');
        return callback(null, JSON.parse(data));
    });
}

/**
 * A custom localization backend for i18next.
 * @extends {Backend}
 * @private
 */
class I18nextBackend {
    constructor(services, options = {}) {
        this.init(services, options);
        this.type = 'backend';
    }

    init(services, options = {}, coreOptions = {}) {
        this.services = services;
        this.options = this.options || {};
        this.options = { ...getDefaults(), ...this.options, ...options };
        this.coreOptions = coreOptions;
        this.modulePaths = new Map();
    }

    read(language, namespace, callback) {
        // Get the module from the namespace, if it exists
        let modulePath;
        namespace = namespace.split(this.options.moduleSeparator, 2);
        if (namespace.length > 1) {
            modulePath = this.modulePaths.get(namespace);
            if (!modulePath) {
                modulePath = this.options.getModulePath(namespace[0]);
                if (modulePath) {
                    this.modulePaths.set(namespace[1], modulePath);
                } else {
                    return callback(new Error(`No module with namespace "${namespace[1]}" found`), false);
                }
            }
            namespace = namespace[1];
        }

        // Get the filename of the localization file
        if (modulePath) {
            const fileName = this.services.interpolator.interpolate(modulePath, {
                lng: language,
                ns: namespace
            });
            return readLocaleFile(fileName, (err, resources) => {
                if (err) {
                    // No retry
                    return callback(err, false);
                }
                return callback(null, resources);
            });
        }

        // Get the resources
        const globalFileName = this.services.interpolator.interpolate(this.options.globalPath, {
            lng: language,
            ns: namespace
        });
        return readLocaleFile(globalFileName, (err, globalResources) => {
            if (err) {
                // No retry
                return callback(err, false);
            }
            if (!this.options.overridePath) {
                return callback(null, globalResources);
            }

            const overrideFileName = this.services.interpolator.interpolate(this.options.overridePath, {
                lng: language,
                ns: namespace
            });
            return readLocaleFile(overrideFileName, (err2, overrideResources) => {
                if (err) {
                    // No retry
                    return callback(err, false);
                }
                // Don't merge arrays, override them instead
                return callback(null, merge(
                    globalResources,
                    readLocaleFile(overrideResources),
                    { arrayMerge: (dest, src) => src }
                ));
            });
        });
    }

    create() {
        // Unsupported at this time
    }
}

module.exports = I18nextBackend;
