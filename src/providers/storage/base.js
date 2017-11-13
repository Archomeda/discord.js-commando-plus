/*
 Original author: Archomeda
 */

/**
 * Handles storage for data.
 * @abstract
 */
class StorageProvider {
    constructor() {
        if (this.constructor.name === 'StorageProvider') {
            throw new Error('StorageProvider is abstract and cannot be instantiated directly');
        }

        /**
         * The associated client with this provider
         * (set once the client is ready, after using {@link CommandoClient#setStorageProvider}).
         * @name StorageProvider#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: null, writable: true });
    }

    /**
     * Initializes the provider by connecting to the storage backend.
     * {@link Client#setStorageProvider} will automatically call this once the client is ready.
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
}

module.exports = StorageProvider;
