/**
 * A base worker that runs independently of any Discord guild.
 * Workers are run globally. Keep that in mind if guild related things are required.
 * @abstract
 */
class Worker {
    /**
     * @typedef {Object} WorkerInfo
     * @property {string} module - The ID of the module the worker belongs to (must be lowercase)
     * @property {string} id - The worker ID (must be lowercase)
     * @property {number} timer - The time in milliseconds at which this worker should operate (must be at least 1
     * second)
     * @property {boolean} [guarded = false] - Whether the worker should be protected from disabling
     */

    /**
     * Constructs a new base worker.
     * @param {CommandoClient} client - The client the module is for
     * @param {WorkerInfo} info - The worker information
     */
    constructor(client, info) {
        if (this.constructor.name === 'Worker') {
            throw new Error('Worker is abstract and cannot be instantiated directly');
        }

        this.constructor.validateInfo(client, info);

        /**
         * The client this module is for.
         * @name Worker#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * ID of the module the command belongs to.
         * @type {string}
         */
        this.moduleID = info.module;

        /**
         * The module the command belongs to, assigned upon registration through a module.
         * @type {?Module}
         */
        this.module = null;

        /**
         * The worker id.
         * @type {string}
         */
        this.id = info.id;

        /**
         * The time in milliseconds at which this worker operates.
         * @type {number}
         */
        this.timer = info.timer;

        /**
         * Whether the worker is protected from being disabled.
         * @type {boolean}
         */
        this.guarded = info.guarded;

        /**
         * Whether the worker is enabled globally.
         * @type {boolean}
         * @private
         */
        this._globalEnabled = true;

        /**
         * The timeout ID.
         * @type {Object}
         * @private
         */
        this._timeoutID = undefined;
    }

    /**
     * Runs the worker.
     * @return {Promise<?Message|?Array<Message>>} The message(s).
     * @abstract
     */
    run() { // eslint-disable-line no-unused-vars
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }

    /**
     * Enables or disables the worker in a guild.
     * @param {?GuildResolvable} guild - The guild to enable or disable the worker in
     * @param {boolean} enabled - Whether the worker should be enabled or disabled
     * @return {void}
     */
    setEnabledIn(guild, enabled) {
        if (typeof guild === 'undefined') {
            throw new TypeError('The parameter guild cannot be undefined');
        }
        if (typeof enabled === 'undefined') {
            throw new TypeError('The parameter enabled cannot be undefined');
        }
        if (this.guarded) {
            throw new Error('The worker is guarded');
        }

        if (!guild) {
            this._globalEnabled = enabled;
            this.client.emit('workerStatusChange', null, this, enabled);
            return;
        }
        guild = this.client.resolver.resolveGuild(guild);
        guild.setWorkerEnabled(this, enabled);
    }

    /**
     * Checks if the worker is enabled in a guild.
     * @param {?GuildResolvable} guild - The guild to check in
     * @return {boolean} True if it's enabled; false otherwise
     */
    isEnabledIn(guild) {
        if (this.guarded) {
            return true;
        }
        if (!guild) {
            return this._globalEnabled;
        }
        guild = this.client.resolver.resolveGuild(guild);
        return guild.isWorkerEnabled(this);
    }

    /**
     * Gets the guilds in which this worker is enabled in.
     * @return {Collection<Snowflake, Guild>} The guilds.
     */
    getEnabledGuilds() {
        return this.client.guilds.filter(g => g.isWorkerEnabled(this));
    }

    /**
     * Starts the worker.
     * @return {void}
     * @private
     */
    start() {
        if (this._timeoutID) {
            clearTimeout(this._timeoutID);
        }
        const exec = () => {
            const result = this.run();
            this._timeoutID = setTimeout(exec, this.timer);
            return result;
        };
        // Explicitly run our worker after 5 seconds
        this._timeoutID = setTimeout(exec, 5000);
    }

    /**
     * Stops the worker.
     * @return {void}
     * @private
     */
    stop() {
        if (this._timeoutID) {
            clearTimeout(this._timeoutID);
            this._timeoutID = undefined;
        }
    }

    /**
     * Reloads the worker.
     * @return {void}
     */
    reload() {
        let workerPath, cached, newWorker;
        try {
            workerPath = this.client.registry.resolveWorkerPath(this.moduleID, this.id);
            cached = require.cache[workerPath];
            delete require.cache[workerPath];
            newWorker = require(workerPath);
        } catch (err) {
            if (cached) {
                require.cache[workerPath] = cached;
            }
            throw err;
        }

        this.client.registry.reregisterWorker(newWorker, this);
    }

    /**
     * Unloads the worker.
     * @return {void}
     */
    unload() {
        const workerPath = this.client.registry.resolveWorkerPath(this.moduleID, this.id);
        if (!require.cache[workerPath]) {
            throw new Error('Worker cannot be unloaded.');
        }
        delete require.cache[workerPath];
        this.client.registry.unregisterWorker(this);
    }


    /**
     * Validates the constructor parameters.
     * @param {CommandoClient} client - The client to validate
     * @param {WorkerInfo} info - The info to validate
     * @return {void}
     * @private
     */
    static validateInfo(client, info) {
        if (!client) {
            throw new Error('A client must be specified');
        }
        if (typeof info !== 'object') {
            throw new TypeError('The worker info must be an object');
        }
        if (typeof info.id !== 'string') {
            throw new TypeError('The worker id must be a string');
        }
        if (info.id !== info.id.toLowerCase()) {
            throw new Error('Worker id must be lowercase.');
        }
        if (info.module !== info.module.toLowerCase()) {
            throw new Error('Worker module must be lowercase.');
        }
        if (typeof info.timer !== 'number' || isNaN(info.timer)) {
            throw new TypeError('Worker timer must be a number.');
        }
        if (info.timer < 1000) {
            throw new RangeError('Worker timer must be at least 1000 (ms).');
        }
    }
}

module.exports = Worker;
