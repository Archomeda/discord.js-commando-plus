/*
 Original author: Archomeda
 */

/**
 * Handles localization.
 * @abstract
 */
class LocaleProvider {
    constructor() {
        if (this.constructor.name === 'LocaleProvider') {
            throw new Error('LocaleProvider is abstract and cannot be instantiated directly');
        }

        /**
         * The associated client with this provider
         * (set once the client is ready, after using {@link CommandoClient#setLocaleProvider}).
         * @name LocaleProvider#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: null, writable: true });
    }

    /**
     * Initializes the provider by connecting to the localization backend.
     * {@link Client#setLocaleProvider} will automatically call this once the client is ready.
     * @param {CommandoClient} client - The client
     * @return {Promise<void>} The promise.
     */
    init(client) { // eslint-disable-line no-unused-vars
        this.client = client;
    }

    /**
     * Destroys the provider.
     * @return {Promise<void>} The promise.
     * @abstract
     */
    destroy() {
        throw new Error(`${this.constructor.name} doesn't implement the destroy function`);
    }

    /**
     * Preloads a namespace.
     * @param {string} namespace - The namespace to preload
     * @return {Promise<void>} The promise.
     */
    preloadNamespace(namespace) {
        return this.preloadNamespaces([namespace]);
    }

    /**
     * Preloads multiple namespaces.
     * @param {string[]} namespaces - The namespaces to preload
     * @return {Promise<void>} The promise.
     * @abstract
     */
    preloadNamespaces(namespaces) { // eslint-disable-line no-unused-vars
        throw new Error(`${this.constructor.name} doesn't implement the preload namespace function`);
    }

    /**
     * Gets the translation of a key.
     * @param {string} namespace - The namespace
     * @param {string} key - The key
     * @param {Object} [vars] - Extra variables for the translator
     * @return {string} The translation.
     * @abstract
     */
    translate(namespace, key, vars) { // eslint-disable-line no-unused-vars
        throw new Error(`${this.constructor.name} doesn't implement the translate function`);
    }

    /**
     * Alias of {@link LocaleProvider#translate}.
     * @param {string} namespace - The namespace
     * @param {string} key - The key
     * @param {Object} [vars] - Extra variables for the translator
     * @return {string} The translation.
     */
    tl(namespace, key, vars) {
        return this.translate(namespace, key, vars);
    }
}

module.exports = LocaleProvider;
