/*
 Original author: Archomeda
 */

/**
 * Handles caching.
 * @abstract
 */
class CacheProvider {
    constructor() {
        if (this.constructor.name === 'CacheProvider') {
            throw new Error('CacheProvider is abstract and cannot be instantiated directly');
        }

        /**
         * The associated client with this provider
         * (set once the client is ready, after using {@link CommandoClient#setCacheProvider}).
         * @name CacheProvider#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: null, writable: true });
    }

    /**
     * Initializes the provider by connecting to the cache backend.
     * {@link CommandoClient#setCacheProvider} will automatically call this once the client is ready.
     * @param {CommandoClient} client - The client
     * @return {Promise<void>} The promise.
     */
    init(client) {
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
     * Determines whether an item exists in the cache.
     * @param {string} table - The table
     * @param {string} key - The item key
     * @return {Promise<boolean>} True if the key exists; false otherwise.
     */
    has(table, key) {
        return this.get(table, key).then(result => Boolean(result));
    }

    /**
     * Gets an item from the cache.
     * @param {string} table - The table
     * @param {string} key - The item key
     * @return {Promise<*>} The cached item; or undefined if nothing has been cached.
     * @abstract
     */
    get(table, key) { // eslint-disable-line no-unused-vars
        throw new Error(`${this.constructor.name} doesn't implement the get function`);
    }

    /**
     * Sets an item in the cache.
     * @param {string} table - The table
     * @param {string} key - The item key
     * @param {number|undefined} ttl - The time-to-live in seconds; or undefined if no ttl
     * @param {*} value - The value
     * @return {Promise<boolean>} True if successful; false otherwise.
     * @abstract
     */
    set(table, key, ttl, value) { // eslint-disable-line no-unused-vars
        throw new Error(`${this.constructor.name} doesn't implement the set function`);
    }

    /**
     * Removes an item from the cache, if it exists.
     * @param {string} table - The table
     * @param {string} key - The item key
     * @return {Promise<boolean>} True if it has been successfully removed or if the item didn't exist; false otherwise.
     * @abstract
     */
    remove(table, key) { // eslint-disable-line no-unused-vars
        throw new Error(`${this.constructor.name} doesn't implement the remove function`);
    }

    /**
     * Gets a cached item if it exists, otherwise renews it by calling renewer.
     * @param {string} table - The table
     * @param {string} key - The item key
     * @param {number} ttl - The time-to-live in seconds
     * @param {function()} renewer - The renewer function that gets called when the cache has expired.
     * @return {Promise<*>} The item.
     */
    async cache(table, key, ttl, renewer) {
        let value = await this.get(table, key);
        if (value) {
            return value;
        }
        value = renewer();
        await this.set(table, key, ttl, value);
        return value;
    }
}

module.exports = CacheProvider;
