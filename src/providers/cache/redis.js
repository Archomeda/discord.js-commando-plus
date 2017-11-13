/*
 Original author: Archomeda
 */

const { promisify } = require('util');
const CacheProvider = require('./base');

/**
 * Handles caching via Redis.
 * @extends {CacheProvider}
 */
class RedisCacheProvider extends CacheProvider {
    /**
     * @external Redis
     * @see {@link https://www.npmjs.com/package/redis}
     */

    /**
     * @param {Redis} redis - The Redis instance
     */
    constructor(redis) {
        super();

        this._cacheGetAsync = promisify(redis.get).bind(redis);
        this._cacheSetAsync = promisify(redis.set).bind(redis);
        this._cacheSetExAsync = promisify(redis.setex).bind(redis);
        this._cacheDelAsync = promisify(redis.del).bind(redis);

        /**
         * The Redis instance that is used for caching.
         * @name RedisCacheProvider#cache
         * @type {Redis}
         * @readonly
         */
        Object.defineProperty(this, 'cache', { value: redis });
    }

    destroy() {
        this._cacheGetAsync = undefined;
        this._cacheSetAsync = undefined;
        this._cacheSetExAsync = undefined;
        this._cacheDelAsync = undefined;
    }

    async get(table, key) {
        if (!this._cacheGetAsync) {
            throw new Error('No cache get function');
        }
        const result = await this._cacheGetAsync(`${table}:${key}`);
        return JSON.parse(result);
    }

    set(table, key, ttl, value) {
        if (!this._cacheSetAsync || !this._cacheSetExAsync) {
            throw new Error('No cache set function');
        }
        return ttl ?
            this._cacheSetExAsync(`${table}:${key}`, ttl, JSON.stringify(value)) :
            this._cacheSetAsync(`${table}:${key}`, JSON.stringify(value));
    }

    async remove(table, key) {
        if (!this._cacheDelAsync) {
            throw new Error('No cache del function');
        }
        return await this._cacheDelAsync(`${table}:${key}`) > 0;
    }
}

module.exports = RedisCacheProvider;
