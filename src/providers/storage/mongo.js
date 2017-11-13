/*
 Original author: Archomeda
 */

const StorageProvider = require('./base');

/**
 * Handles storage for data via Mongoose.
 * @extends {StorageProvider}
 */
class MongoStorageProvider extends StorageProvider {
    /**
     * @external Mongoose
     * @see {@link https://www.npmjs.com/package/mongoose}
     */

    /**
     * @param {Mongoose} mongoose - The Mongoose instance
     * @example
     * // Create and use a new Mongoose storage provider
     * const mongoose = require('mongoose');
     * client.setStorageProvider(new MongoStorageProvider(await mongoose.createConnection(/* params *\/)));
     */
    constructor(mongoose) {
        super();

        /**
         * The Mongoose instance that is used for storage.
         * @name MongoStorageProvider#db
         * @type {Mongoose}
         * @readonly
         */
        Object.defineProperty(this, 'db', { value: mongoose });

        /**
         * The registered models.
         * @type {Map}
         * @private
         */
        this.models = new Map();
    }

    destroy() {
        this.models.clear();
        this.db.close();
    }

    /**
     * Gets a registered model.
     * @param {string} modelName - The model name
     * @return {*} The model.
     */
    model(modelName) {
        return this.models.get(modelName);
    }

    /**
     * Registers a model.
     * @param {string} modelName - The model name
     * @param {Mongoose.Schema} modelSchema - The Mongoose schema
     * @return {void}
     */
    registerModel(modelName, modelSchema) {
        this.models.set(modelName, this.db.model(modelName, modelSchema));
    }
}

module.exports = MongoStorageProvider;
