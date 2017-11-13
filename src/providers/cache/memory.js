/*
 Original author: Archomeda
 */

const { promisify } = require('util');
const CacheProvider = require('./base');

/**
 * Handles caching in-memory. Handled by node-cache.
 * @extends {CacheProvider}
 */
class MemoryCacheProvider extends CacheProvider {
    /**
     * @external NodeCache
     * @see {@link https://www.npmjs.com/package/node-cache}
     */

    /**
     * @param {NodeCache} nodeCache - The NodeCache instance
     */
    constructor(nodeCache) {
        super();

        this._cacheGetAsync = promisify(nodeCache.get).bind(nodeCache);
        this._cacheSetAsync = promisify(nodeCache.set).bind(nodeCache);
        this._cacheDelAsync = promisify(nodeCache.del).bind(nodeCache);

        /**
         * The NodeCache instance that is used for caching.
         * @name MemoryCacheProvider#cache
         * @type {NodeCache}
         * @readonly
         */
        Object.defineProperty(this, 'cache', { value: nodeCache });
    }

    destroy() {
        this._cacheGetAsync = undefined;
        this._cacheSetAsync = undefined;
        this._cacheDelAsync = undefined;
    }

    get(table, key) {
        if (!this._cacheGetAsync) {
            throw new Error('No cache get function');
        }
        return this._cacheGetAsync(`${table}:${key}`);
    }

    set(table, key, ttl, value) {
        if (!this._cacheSetAsync) {
            throw new Error('No cache set function');
        }
        return this._cacheSetAsync(`${table}:${key}`, value, ttl);
    }

    async remove(table, key) {
        if (!this._cacheDelAsync) {
            throw new Error('No cache del function');
        }
        return await this._cacheDelAsync(`${table}:${key}`) > 0;
    }
}

module.exports = MemoryCacheProvider;
