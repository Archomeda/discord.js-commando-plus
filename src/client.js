/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Renamed CommandoClient.provider to CommandoClient.settingsProvider
 - Renamed CommandoClient.setProvider() to CommandoClient.setSettingsProvider()
 - Added CommandoClientOptions.commandReactableDuration
 - Added CommandoClient.initProvider()
 - Added CommandoClient.cacheProvider, CommandoClient.setCacheProvider()
 - Added CommandoClient.localeProvider, CommandoClient.setLocaleProvider()
 - Added CommandoClient.storageProvider, CommandoClient.setStorageProvider()
 - Changed CommandoClient.setSettingsProvider()
 */

const discord = require('discord.js');
const CommandRegistry = require('./registry');
const CommandDispatcher = require('./dispatcher');
const GuildSettingsHelper = require('./providers/settings/helper');
const LocaleHelper = require('./providers/locale/helper');

/**
 * Discord.js Client with a command framework
 * @extends {Client}
 */
class CommandoClient extends discord.Client {
    /**
     * Options for a CommandoClient
     * @typedef {ClientOptions} CommandoClientOptions
     * @property {boolean} [selfbot=false] - Whether the command dispatcher should be in selfbot mode
     * @property {string} [language=en-US] - Default language for all localizations
     * @property {string} [commandPrefix=!] - Default command prefix
     * @property {number} [commandEditableDuration=30] - Time in seconds that command messages should be editable
     * @property {number} [commandReactableDuration=300] - Time in seconds that command messages should be reactable
     * @property {boolean} [nonCommandEditable=true] - Whether messages without commands can be edited to a command
     * @property {boolean} [unknownCommandResponse=true] - Whether the bot should respond to an unknown command
     * @property {string|string[]|Set<string>} [owner] - ID of the bot owner's Discord user, or multiple IDs
     * @property {string} [invite] - Invite URL to the bot's support server
     */

    /**
     * @param {CommandoClientOptions} [options] - Options for the client
     */
    constructor(options = {}) {
        if (typeof options.selfbot === 'undefined') {
            options.selfbot = false;
        }
        if (typeof options.language === 'undefined') {
            options.language = 'en-US';
        }
        if (typeof options.commandPrefix === 'undefined') {
            options.commandPrefix = '!';
        }
        if (options.commandPrefix === null) {
            options.commandPrefix = '';
        }
        if (typeof options.commandEditableDuration === 'undefined') {
            options.commandEditableDuration = 30;
        }
        if (typeof options.commandReactableDuration === 'undefined') {
            options.commandReactableDuration = 300;
        }
        if (typeof options.nonCommandEditable === 'undefined') {
            options.nonCommandEditable = true;
        }
        if (typeof options.unknownCommandResponse === 'undefined') {
            options.unknownCommandResponse = true;
        }
        super(options);

        /**
         * The client's command registry.
         * @type {CommandRegistry}
         */
        this.registry = new CommandRegistry(this);

        /**
         * The client's command dispatcher.
         * @type {CommandDispatcher}
         */
        this.dispatcher = new CommandDispatcher(this, this.registry);

        /**
         * The client's cache provider.
         * @type {?CacheProvider}
         */
        this.cacheProvider = null;

        /**
         * The client's locale provider.
         * @type {?LocaleProvider}
         */
        this.localeProvider = null;

        /**
         * The client's settings provider.
         * @type {?SettingsProvider}
         */
        this.settingsProvider = null;

        /**
         * The client's storage provider.
         * @type {?StorageProvider}
         */
        this.storageProvider = null;

        /**
         * Shortcut to use locale provider methods for the global locales.
         * @type {LocaleHelper}
         */
        this.localization = new LocaleHelper(this, null);

        /**
         * Shortcut to use settings provider methods for the global settings.
         * @type {GuildSettingsHelper}
         */
        this.settings = new GuildSettingsHelper(this, null);

        /**
         * The client's language.
         * @type {string}
         * @private
         */
        this._language = options.language;

        /**
         * Internal global command prefix, controlled by the {@link CommandoClient#commandPrefix} getter/setter.
         * @type {?string}
         * @private
         */
        this._commandPrefix = null;

        // Set up command handling
        const msgErr = err => this.emit('error', err);
        this.on('message', message =>
            this.dispatcher.handleMessage(message).catch(msgErr));
        this.on('messageUpdate', (oldMessage, newMessage) =>
            this.dispatcher.handleMessage(newMessage, oldMessage).catch(msgErr));
        this.on('messageReactionAdd', (reaction, user) =>
            this.dispatcher.handleReaction(reaction, user).catch(msgErr));
        this.on('messageReactionRemove', (reaction, user) =>
            this.dispatcher.handleReaction(reaction, user).catch(msgErr));

        // Fetch the owner(s)
        if (options.owner) {
            this.once('ready', () => {
                if (options.owner instanceof Array || options.owner instanceof Set) {
                    for (const owner of options.owner) {
                        this.fetchUser(owner).catch(err => {
                            this.emit('warn', `Unable to fetch owner ${owner}.`);
                            this.emit('error', err);
                        });
                    }
                } else {
                    this.fetchUser(options.owner).catch(err => {
                        this.emit('warn', `Unable to fetch owner ${options.owner}.`);
                        this.emit('error', err);
                    });
                }
            });
        }
    }

    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @type {string}
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get commandPrefix() {
        if (typeof this._commandPrefix === 'undefined' || this._commandPrefix === null) {
            return this.options.commandPrefix;
        }
        return this._commandPrefix;
    }

    set commandPrefix(prefix) {
        this._commandPrefix = prefix;
        this.emit('commandPrefixChange', null, this._commandPrefix);
    }

    /**
     * Global language. Setting to `null` means that the language from {@link CommandoClient#options} will be used
     * instead.
     * @type {?string}
     * @emits {@link CommandoClient#languageChange}
     */
    get language() {
        if (typeof this._language === 'undefined' || this._language === null) {
            return this.options.language;
        }
        return this._language;
    }

    set language(language) {
        this._language = language;
        this.emit('languageChange', null, this._language);
    }

    /**
     * Owners of the bot, set by the {@link CommandoClientOptions#owner} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @type {?Array<User>}
     * @readonly
     */
    get owners() {
        if (!this.options.owner) {
            return null;
        }
        if (typeof this.options.owner === 'string') {
            return [this.users.get(this.options.owner)];
        }
        const owners = [];
        for (const owner of this.options.owner) {
            owners.push(this.users.get(owner));
        }
        return owners;
    }

    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner}).
     * @param {UserResolvable} user - User to check for ownership
     * @return {boolean} True if the user is an owner; false otherwise.
     */
    isOwner(user) {
        if (!this.options.owner) {
            return false;
        }
        user = this.resolver.resolveUser(user);
        if (!user) {
            throw new RangeError('Unable to resolve user.');
        }
        if (typeof this.options.owner === 'string') {
            return user.id === this.options.owner;
        }
        if (this.options.owner instanceof Array) {
            return this.options.owner.includes(user.id);
        }
        if (this.options.owner instanceof Set) {
            return this.options.owner.has(user.id);
        }
        throw new RangeError('The client\'s "owner" option is an unknown value.');
    }

    /**
     * Sets the cache provider to use, and initializes it once the client is ready.
     * @param {CacheProvider|Promise<CacheProvider>} provider - The cache provider to use
     * @return {Promise<void>} The promise.
     */
    async setCacheProvider(provider) {
        provider = await provider;
        this.cacheProvider = provider;
        return this.initProvider(provider, 'cache provider');
    }

    /**
     * Sets the locale provider to use, and initializes it once the client is ready.
     * @param {LocaleProvider|Promise<LocaleProvider>} provider - The locale provider to use
     * @return {Promise<void>} The promise.
     */
    async setLocaleProvider(provider) {
        provider = await provider;
        this.localeProvider = provider;
        return this.initProvider(provider, 'locale provider');
    }

    /**
     * Sets the settings provider to use, and initializes it once the client is ready.
     * @param {SettingsProvider|Promise<SettingsProvider>} provider - The settings provider to use
     * @return {Promise<void>} The promise.
     */
    async setSettingsProvider(provider) {
        provider = await provider;
        this.settingsProvider = provider;
        return this.initProvider(provider, 'settings provider');
    }

    /**
     * Sets the storage provider to use, and initializes it once the client is ready.
     * @param {StorageProvider|Promise<StorageProvider>} provider - The storage provider to use
     * @return {Promise<void>} The promise.
     */
    async setStorageProvider(provider) {
        provider = await provider;
        this.storageProvider = provider;
        return this.initProvider(provider, 'storage provider');
    }

    /**
     * Initializes a provider.
     * @param {CacheProvider|LocaleProvider|SettingsProvider|StorageProvider} provider - The provider to initialize
     * @param {string} logName - The name to log when initializing
     * @return {Promise<void>} The promise.
     * @private
     */
    async initProvider(provider, logName) {
        if (this.readyTimestamp) {
            this.emit('debug', `Set ${logName} to ${provider.constructor.name} - initializing...`);
            await provider.init(this);
            this.emit('debug', `Finished initialization of ${logName}`);
        } else {
            this.emit('debug', `Set ${logName} to ${provider.constructor.name} - initialize once client is ready`);
            this.once('ready', async() => {
                this.emit('debug', `Initializing ${logName}...`);
                await provider.init(this);
                this.emit('debug', `Finished initialization of ${logName}`);
            });
        }
    }

    async destroy() {
        await super.destroy();
        if (this.provider) {
            await Promise.all([
                this.cacheProvider.destroy(),
                this.localeProvider.destroy(),
                this.settingsProvider.destroy(),
                this.storageProvider.destroy()
            ]);
        }
    }
}

module.exports = CommandoClient;
