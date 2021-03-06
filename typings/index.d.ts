declare module '18next' {
    export interface i18next {}
}

declare module 'mongoose' {
    export interface Mongoose {}
    export interface Schema {}
}

declare module 'node-cache' {
    export interface NodeCache {}
}

declare module 'redis' {
    export interface Redis {}
}

declare module 'sqlite' {
    export interface Database {}
    export interface Statement {}
}

declare module 'discord.js-commando-plus' {
    import { Channel, ChannelResolvable, Client, ClientOptions, ClientUserSettings, Collection, DMChannel, Emoji, GroupDMChannel, Guild, GuildChannel, GuildMember, GuildResolvable, Message, MessageAttachment, MessageEmbed, MessageOptions, MessageReaction, PermissionResolvable, ReactionEmoji, RichEmbed, Role, Snowflake, StringResolvable, TextChannel, User, UserResolvable, Webhook } from 'discord.js';
    import { i18next } from 'i8next';
    import { Mongoose, Schema as MongooseSchema } from 'mongoose';
    import { NodeCache } from 'node-cache';
    import { Redis } from 'redis';
    import { Database as SQLiteDatabase, Statement as SQLiteStatement } from 'sqlite';

    export class Argument {
        private constructor(client: CommandoClient, info: ArgumentInfo);

        private obtainInfinite(msg: CommandMessage, values?: string[], promptLimit?: number): Promise<ArgumentResult>;
        
        private static validateInfo(client: CommandoClient, info: ArgumentInfo);

        public default: any;
        public infinite: boolean;
        public key: string;
        public label: string;
        public max: number;
        public min: number;
        public parser: Function;
        public prompt: string;
        public type: ArgumentType;
        public validator: Function;
        public wait: number;

        public obtain(msg: CommandMessage, value?: string, promptLimit?: number): Promise<ArgumentResult>;
        public parse(value: string, msg: CommandMessage): any | Promise<any>;
        public validate(value: string, msg: CommandMessage): boolean | string | Promise<boolean | string>;
    }

    export class ArgumentCollector {
        public constructor(client: CommandoClient, args: ArgumentInfo[], promptLimit?: number);

        public args: Argument[];
        public readonly client: CommandoClient;
        public promptLimit: number;

        public obtain(msg: CommandMessage, provided?: any[], promptLimit?: number): Promise<ArgumentCollectorResult>;
    }

    export class ArgumentType {
        public constructor(client: CommandoClient, id: string);

        public readonly client: CommandoClient;
        public id: string;

        public parse(value: string, msg: CommandMessage, arg: Argument): any | Promise<any>;
        public validate(value: string, msg: CommandMessage, arg: Argument): boolean | string | Promise<boolean | string>;
    }

    export class CacheProvider {
        public readonly client: CommandoClient;

        public destroy(): Promise<void>;
        public cache(table: string, key: string, ttl: number, renewer: Function): Promise<any>;
        public get(table: string, key: string): Promise<any>;
        public has(table: string, key: string): Promise<boolean>;
        public init(client: CommandoClient): Promise<void>;
        public set(table: string, key: string, ttl: number, value: any): Promise<boolean>;
        public remove(table: string, key: string): Promise<boolean>;
    }

    export class Command {
        public constructor(client: CommandoClient, info: CommandInfo);

        private _globalEnabled: boolean;
        private _throttles: Map<string, object>;

        private throttle(userID: string): object;
        
        private static validateInfo(client: CommandoClient, info: CommandInfo);

        public aliases: string[];
        public argsCount: number;
        public argsSingleQuotes: boolean;
        public argsType: string;
        public readonly client: CommandoClient;
        public defaultHandling: boolean;
        public description: string;
        public details: string;
        public examples: string[];
        public format: string;
        public group: CommandGroup;
        public groupID: string;
        public guarded: boolean;
        public guildOnly: boolean;
        public localization: CommandLocaleHelper;
        public memberName: string;
        public module: Module;
        public moduleID: string;
        public name: string;
        public patterns: RegExp[];
        public throttling: ThrottlingOptions;

        public clearWhitelistIn(guild: GuildResolvable): void;
        public editTimeout(message: CommandMessage, response: Message): Promise<CommandMessage>;
        public getMissingPermissions(message: CommandMessage): PermissionResolvable[];
        public hasPermission(message: CommandMessage): boolean;
        public isEnabledIn(guild: GuildResolvable): boolean;
        public isUsable(message: Message): boolean;
        public isWhitelistedIn(guild: GuildResolvable, channel: ChannelResolvable): boolean;
        public reactTimeout(message: CommandMessage, response: Message): Promise<CommandMessage>;
        public reload(): void;
        public run(message: CommandMessage, args: object | string | string[], fromPattern: boolean): Promise<Message | Message[]>;
        public runReact(message: CommandMessage, reaction: MessageReaction): Promise<Message>;
        public setBlacklistIn(guild: GuildResolvable, list: ChannelResolvable[]): void;
        public setEnabledIn(guild: GuildResolvable, enabled: boolean): void;
        public setWhitelistIn(guild: GuildResolvable, list: ChannelResolvable[]): void;
        public shouldHandleReaction(message: CommandMessage, reaction: MessageReaction, user: User): boolean;
        public unload(): void;
        public usage(argString?: string, prefix?: string, user?: User): string;

        public static usage(command: string, prefix?: string, user?: User): string;
    }

    export class CommandDispatcher {
        public constructor(client: CommandoClient, registry: CommandRegistry);

        private _awaiting: Set<string>;
        private _commandPatterns: object;
        private _results: Map<string, CommandMessage>;

        private buildCommandPattern(prefix: string): RegExp;
        private cacheCommandMessage(message: Message, oldMessage: Message, cmdMsg: CommandMessage, responses: Message | Message[], timeoutIds?: Object): void;
        private handleMessage(messge: Message, oldMessage?: Message): Promise<void>;
        private inhibit(cmdMsg: CommandMessage): [Inhibitor, undefined];
        private matchDefault(message: Message, pattern: RegExp, commandNameIndex: number): CommandMessage;
        private parseMessage(message: Message): CommandMessage;
        private shouldHandleMessage(message: Message, oldMessage?: Message): boolean;

        public readonly client: CommandoClient;
        public inhibitors: Set<Function>;
        public registry: CommandRegistry;

        public addInhibitor(inhibitor: Inhibitor): boolean;
        public removeInhibitor(inhibitor: Inhibitor): boolean;
    }

    export class CommandFormatError extends FriendlyError {
        public constructor(msg: CommandMessage);
    }

    export class CommandGroup {
        public constructor(client: CommandoClient, id: string, name?: string, guarded?: boolean, commands?: Command[]);

        public readonly client: CommandoClient;
        public commands: Collection<string, Command>;
        public guarded: boolean;
        public id: string;
        public moduleID: string;
        public module: Module;
        public name: string;

        public isEnabledIn(guild: GuildResolvable): boolean;
        public reload(): void;
        public setEnabledIn(guild: GuildResolvable, enabled: boolean): void;
    }

    export class CommandLocaleHelper {
        public constructor(client: CommandoClient, command: Command);

        public readonly client: CommandoClient;
        public readonly command: Command;

        public tl(key: string, guild: GuildResolvable, vars?: {}): string;
        public translate(key: string, guild: GuildResolvable, vars?: {}): string;
    }

    export class CommandMessage {
        public constructor(message: Message, command?: Command, argString?: string, patternMatches?: string[]);

        private deleteRemainingResponses(): void;
        private editCurrentResponse(id: string, options?: {}): Promise<Message | Message[]>;
        private editResponse(response: Message | Message[], options?: {}): Promise<Message | Message[]>;
        private finalize(responses: Message | Message[]): void;
        private respond(options?: {}): Message | Message[];

        public argString: string;
        public readonly attachments: Collection<string, MessageAttachment>;
        public readonly author: User;
        public readonly channel: TextChannel | DMChannel | GroupDMChannel;
        public readonly cleanContent: string;
        public readonly client: CommandoClient;
        public command: Command;
        public readonly content: string;
        public readonly createdAt: Date;
        public readonly createdTimestamp: number;
        public readonly deletable: boolean;
        public readonly editable: boolean;
        public readonly editedAt: Date;
        public readonly editedTimestamp: number;
        public readonly edits: Message[];
        public readonly embeds: MessageEmbed[];
        public readonly guild: Guild;
        public readonly id: string;
        public readonly member: GuildMember;
        public readonly mentions: {};
        public message: Message;
        public readonly nonce: string;
        public patternMatches: string[];
        public readonly pinnable: boolean;
        public readonly pinned: boolean;
        public readonly reactions: Collection<string, MessageReaction>;
        public responsePositions: {};
        public responses: {};
        public readonly system: boolean;
        public readonly tts: boolean;
        public readonly webhookID: string;

        public anyUsage(command?: string, prefix?: string, user?: User): string;
        public clearReactions(): Promise<Message>;
        public code(lang: string, content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>
        public delete(timeout?: number): Promise<Message>;
        public direct(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
        public edit(content: StringResolvable): Promise<Message>
        public editCode(lang: string, content: StringResolvable): Promise<Message>;
        public embed(embed: RichEmbed | {}, content?: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
        public fetchWebhook(): Promise<Webhook>;
        public isMemberMentioned(member: GuildMember | User): boolean;
        public isMentioned(data: GuildChannel | User | Role | string): boolean;
        public parseArgs(): string | string[];
        public static parseArgs(argString: string, argCount?: number, allowSingleQuote?: boolean): string[];
        public pin(): Promise<Message>
        public react(emoji: string | Emoji | ReactionEmoji): Promise<MessageReaction>;
        public reply(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
        public replyEmbed(embed: RichEmbed | {}, content?: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
        public run(): Promise<Message | Message[]>;
        public say(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]>;
        public unpin(): Promise<Message>;
        public usage(argString?: string, prefix?: string, user?: User): string;
    }

    export class CommandoClient extends Client {
        public constructor(options?: CommandoClientOptions);

        private _commandPrefix: string;

        public cacheProvider: CacheProvider;
        public commandPrefix: string;
        public dispatcher: CommandDispatcher;
        public language: String;
        public localeProvider: LocaleProvider;
        public readonly owners: User[];
        public settingsProvider: SettingsProvider;
        public storageProvider: StorageProvider;
        public registry: CommandRegistry;
        public settings: GuildSettingsHelper;

        private initProvider(provider: CacheProvider | LocaleProvider | SettingsProvider | StorageProvider, logName: string): Promise<void>;
        public isOwner(user: UserResolvable): boolean;
        public setCacheProvider(provider: CacheProvider | Promise<CacheProvider>): Promise<void>;
        public setLocaleProvider(provider: LocaleProvider | Promise<LocaleProvider>): Promise<void>;
        public setSettingsProvider(provider: SettingsProvider | Promise<SettingsProvider>): Promise<void>;
        public setStorageProvider(provider: StorageProvider | Promise<StorageProvider>): Promise<void>;

        on(event: string, listener: Function): this;
        on(event: 'commandBlocked', listener: (message: CommandMessage, reason: string) => void): this;
        on(event: 'commandError', listener: (command: Command, err: Error, message: CommandMessage, args: {} | string | string[], fromPattern: boolean) => void): this;
        on(event: 'commandPrefixChange', listener: (guild: Guild, prefix: string) => void): this;
        on(event: 'commandRegister', listener: (command: Command, registry: CommandRegistry) => void): this;
        on(event: 'commandReregister', listener: (newCommand: Command, oldCommand: Command) => void): this;
        on(event: 'commandRun', listener: (command: Command, promise: Promise<any>, message: CommandMessage, args: object | string | string[], fromPattern: boolean) => void): this;
        on(event: 'commandStatusChange', listener: (guild: Guild, command: Command, enabled: boolean) => void): this;
        on(event: 'commandUnregister', listener: (command: Command) => void): this;
        on(event: 'groupRegister', listener: (group: CommandGroup, registry: CommandRegistry) => void): this;
        on(event: 'groupStatusChange', listener: (guild: Guild, group: CommandGroup, enabled: boolean) => void): this;
        on(event: 'languageChange', listener: (guild?: Guild, language?: string) => void): this;
        on(event: 'typeRegister', listener: (type: ArgumentType, registry: CommandRegistry) => void): this;
        on(event: 'unknownCommand', listener: (message: CommandMessage) => void): this;
        on(event: 'workerRegister', listener: (worker: Worker, registry: Registry) => void): this;
        on(event: 'workerReregister', listener: (newWorker: Worker, oldWorker: Worker) => void): this;
        on(event: 'workerStatusChange', listener: (guild?: Guild, worker: Worker, enabled: boolean) => void): this;
        on(event: 'workerUnregister', listener: (worker: Worker) => void): this;
        on(event: 'channelCreate', listener: (channel: Channel) => void): this;
        on(event: 'channelDelete', listener: (channel: Channel) => void): this;
        on(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date) => void): this;
        on(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel) => void): this;
        on(event: 'clientUserSettingsUpdate', listener: (clientUserSettings: ClientUserSettings) => void): this;
        on(event: 'debug', listener: (info: string) => void): this;
        on(event: 'disconnect', listener: (event: any) => void): this;
        on(event: 'emojiCreate', listener: (emoji: Emoji) => void): this;
        on(event: 'emojiDelete', listener: (emoji: Emoji) => void): this;
        on(event: 'emojiUpdate', listener: (oldEmoji: Emoji, newEmoji: Emoji) => void): this;
        on(event: 'error', listener: (error: Error) => void): this;
        on(event: 'guildBanAdd', listener: (guild: Guild, user: User) => void): this;
        on(event: 'guildBanRemove', listener: (guild: Guild, user: User) => void): this;
        on(event: 'guildCreate', listener: (guild: Guild) => void): this;
        on(event: 'guildDelete', listener: (guild: Guild) => void): this;
        on(event: 'guildMemberAdd', listener: (member: GuildMember) => void): this;
        on(event: 'guildMemberAvailable', listener: (member: GuildMember) => void): this;
        on(event: 'guildMemberRemove', listener: (member: GuildMember) => void): this;
        on(event: 'guildMembersChunk', listener: (members: Collection<Snowflake, GuildMember>, guild: Guild) => void): this;
        on(event: 'guildMemberSpeaking', listener: (member: GuildMember, speaking: boolean) => void): this;
        on(event: 'guildMemberUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
        on(event: 'guildUnavailable', listener: (guild: Guild) => void): this;
        on(event: 'guildUpdate', listener: (oldGuild: Guild, newGuild: Guild) => void): this;
        on(event: 'message', listener: (message: Message) => void): this;
        on(event: 'messageDelete', listener: (message: Message) => void): this;
        on(event: 'messageDeleteBulk', listener: (messages: Collection<Snowflake, Message>) => void): this;
        on(event: 'messageReactionAdd', listener: (messageReaction: MessageReaction, user: User) => void): this;
        on(event: 'messageReactionRemove', listener: (messageReaction: MessageReaction, user: User) => void): this;
        on(event: 'messageReactionRemoveAll', listener: (message: Message) => void): this;
        on(event: 'messageUpdate', listener: (oldMessage: Message, newMessage: Message) => void): this;
        on(event: 'presenceUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
        on(event: 'ready', listener: () => void): this;
        on(event: 'reconnecting', listener: () => void): this;
        on(event: 'roleCreate', listener: (role: Role) => void): this;
        on(event: 'roleDelete', listener: (role: Role) => void): this;
        on(event: 'roleUpdate', listener: (oldRole: Role, newRole: Role) => void): this;
        on(event: 'typingStart', listener: (channel: Channel, user: User) => void): this;
        on(event: 'typingStop', listener: (channel: Channel, user: User) => void): this;
        on(event: 'userNoteUpdate', listener: (user: UserResolvable, oldNote: string, newNote: string) => void): this;
        on(event: 'userUpdate', listener: (oldUser: User, newUser: User) => void): this;
        on(event: 'voiceStateUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
        on(event: 'warn', listener: (info: string) => void): this;
    }

    export class CommandRegistry {
        public constructor(client?: CommandoClient);

        public readonly client: CommandoClient;
        public commands: Collection<string, Command>;
        public evalObjects: object;
        public groups: Collection<string, CommandGroup>;
        public modules: Collection<string, Module>;
        public types: Collection<string, ArgumentType>;
        public workers: Collection<string, Worker>;

        public findCommands(searchString?: string, exact?: boolean, message?: Message): Command[];
        public findGroups(searchString?: string, exact?: boolean): CommandGroup[];
        public findModules(searchString?: string, exact?: boolean): Module[];
        public findWorkers(searchString?: string, exact?: boolean): Worker[];
        public registerBuiltInModule() : Promise<CommandRegistry>;
        public registerCommand(command: Command | Function): CommandRegistry;
        public registerCommands(commands: Command[] | Function[]): CommandRegistry;
        public registerDefaults(): Promise<CommandRegistry>;
        public registerDefaultTypes(): CommandRegistry;
        public registerEvalObject(key: string, obj: {}): CommandRegistry;
        public registerEvalObjects(obj: {}): CommandRegistry;
        public registerModule(module: Module): Promise<CommandRegistry>;
        public registerModules(modules: Module[]): Promise<CommandRegistry>;
        public registerGroup(group: CommandGroup | Function | string[] | string, name?: string): CommandRegistry;
        public registerGroups(groups: CommandGroup[] | Function[] | string[][] | string[]): CommandRegistry;
        public registerType(type: ArgumentType | Function): CommandRegistry;
        public registerTypes(type: ArgumentType[] | Function[]): CommandRegistry;
        public registerTypesIn(options: string | {}): CommandRegistry;
        public registerWorker(worker: Worker | Function): Promise<CommandRegistry>;
        public registerWorkers(workers: Worker[] | Function[]): Promise<CommandRegistry>;
        public reregisterCommand(command: Command | Function, oldCommand: Command): void;
        public reregistryWorkers(worker: Worker | Function, oldWorker: Worker): Promise<void>;
        public resolveCommand(command: CommandResolvable): Command;
        public resolveCommandPath(module: ModuleResolvable, groups: string, memberName: string): string;
        public resolveGroup(group: CommandGroupResolvable): CommandGroup;
        public resolveWorker(worker: WorkerResolvable): Worker;
        public resolveModule(module: ModuleResolvable): Module;
        public unregisterCommand(command: Command): void;
        public unregisterWorker(worker: Worker): Promise<CommandRegistry>;
    }

    export class FriendlyError extends Error {
        public constructor(message: string);
    }

    export class GuildExtension extends Guild {
        private _commandPrefix: string;
        private _commandsEnabled: object;
        private _groupsEnabled: object;
        private _settings: GuildSettingsHelper;
        private static applyToClass(target: Function): void;

        public commandPrefix: string;
        public language: string;
        public readonly settings: GuildSettingsHelper;

        public commandUsage(command?: string, user?: User): string;
        public isCommandEndabled(command: CommandResolvable): boolean;
        public isGroupEnabled(group: CommandGroupResolvable): boolean;
        public isWorkerEnabled(worker: WorkerResolvable): boolean;
        public setCommandEnabled(command: CommandResolvable, enabled: boolean): void;
        public setGroupdEnabled(group: CommandGroupResolvable, enabled: boolean): void;
        public setWorkerEnabled(worker: WorkerResolvable, enabled: boolean): void;
    }

    export class GuildSettingsHelper {
        public constructor(client: CommandoClient, guild: Guild);

        public readonly client: CommandoClient;
        public guild: Guild;

        public clear(): Promise<void>;
        public get(key: string, defVal?: any): any;
        public remove(key: string): Promise<any>;
        public set(key: string, value: any): Promise<any>;
    }

    export class I18nextLocaleProvider extends LocaleProvider {
        public constructor(i18next: i18next, directory: string, options: Object);

        public readonly directory: string;
        public readonly localizer: i18next;
        public readonly options: Object;
    }

    export class LocaleHelper {
        public constructor(client: CommandoClient, module: Module);

        public readonly client: CommandoClient;
        public readonly module: Module;

        public tl(namespace: string, key: string, guild: GuildResolvable, vars?: {}): string;
        public translate(namespace: string, key: string, guild: GuildResolvable, vars?: {}): string;
    }

    export class LocaleProvider {
        public readonly client: CommandClient;

        public destroy(): Promise<void>;
        public init(client: CommandoClient): Promise<void>;
        public preloadNamespace(namespace: string, lang: string): void;
        public preloadNamespaces(namespaces: string[], lang: string): void;
        public tl(module: string, namespace: string, key: string, lang: string, vars?: {}): string;
        public translate(module: string, namespace: string, key: string, lang: string, vars?: {}): string;
    }

    export class MemoryCacheProvider extends CacheProvider {
        public constructor(nodeCache: NodeCache);

        public readonly cache: NodeCache;

        public destroy(): Promise<void>;
        public get(table: string, key: string): Promise<any>;
        public set(table: string, key: string, ttl: number, value: any): Promise<boolean>;
        public remove(table: string, key: string): Promise<boolean>;
    }

    export class Module {
        public readonly client: CommandoClient;
        public commands: Collection<string, Command>;
        public groups: CommandGroup[] | Function[] | string[][] | string[];
        public id: string;
        public localization: LocaleHelper;
        public localizationDirectory: string;
    }

    export class MongoStorageProvider extends StorageProvider {
        public readonly db: Mongoose;
        private models: Map;

        public destroy(): Promise<void>;
        public model(modelName: string): any;
        public registerModel(modelName: string, modelSchema: MongooseSchema): void;
    }

    export class RedisCacheProvider extends CacheProvider {
        public constructor(redis: Redis);

        public readonly cache: Redis;

        public destroy(): Promise<void>;
        public get(table: string, key: string): Promise<any>;
        public set(table: string, key: string, ttl: number, value: any): Promise<boolean>;
        public remove(table: string, key: string): Promise<boolean>;
    }

    export class SettingsProvider {
        public readonly client: CommandoClient;
        private listeners: Map<any, any>;
        private settings: Map<any, any>;

        public clear(guild: Guild | string): Promise<void>;
        public destroy(): Promise<void>;
        public get(guild: Guild | string, key: string, defVal?: any): any;
        public getGuildID(guild: Guild | string): string;
        public init(client: CommandoClient): Promise<void>;
        private initListeners(): void;
        public remove(guild: Guild | string, key: string): Promise<any>;
        public set(guild: Guild | string, key: string, val: any): Promise<any>;
        private setupGuild(guild: string, settings: {}): void;
        private setupGuildCommand(guild: Guild, command: Command, settings: {}): void;
        private setupGuildGroup(guild: Guild, group: CommandGroup, settings: {}): void;
        private setupGuildWorker(guild: Guild, worker: Worker, settings: {}): void;
        private updateOtherShards(key: string, val: any): void;
    }

    export class StorageProvider {
        public readonly client: CommandoClient;

        public destroy(): Promise<void>;
        public init(client: CommandoClient): Promise<void>;
    }

    export class SQLiteSettingsProvider extends SettingsProvider {
        public constructor(db: SQLiteDatabase);

        public db: SQLiteDatabase;
        private deleteStmt: SQLiteStatement;
        private insertOrReplaceStmt: SQLiteStatement;

        public clear(guild: Guild | string): Promise<void>;
        public destroy(): Promise<void>;
        public init(client: CommandoClient): Promise<void>;
        public remove(guild: Guild | string, key: string): Promise<any>;
        public set(guild: Guild | string, key: string, val: any): Promise<any>;
    }

    export class Worker {
        public constructor(client: CommandoClient, info: WorkerInfo);

        private _globalEnabled: boolean;

        private static validateInfo(client: CommandoClient, info: WorkerInfo);

        public id: string;
        public globalEnabledDefault: boolean;
        public guildEnabledDefault: boolean;
        public guarded: boolean;
        public localization: WorkerLocaleHelper;
        public module: Module;
        public moduleID: string;

        public isEnabledIn(guild: GuildResolvable): boolean;
        public getEnabledGuilds(): Collection<Snowflake, Guild>;
        public onStart(): Promise<void>;
        public onStop(): Promise<void>;
        public run(): Promise<void>;
        public reload(): Promise<void>;
        public setEnabledIn(guild: GuildResolvable, enabled: boolean): Promise<void>;
        public unload(): void;

        public static usage(command: string, prefix?: string, user?: User): string;
    }

    export class WorkerLocaleHelper {
        public constructor(client: CommandoClient, worker: Worker);

        public readonly client: CommandoClient;
        public readonly worker: Worker;

        public tl(key: string, guild: GuildResolvable, vars?: {}): string;
        public translate(key: string, guild: GuildResolvable, vars?: {}): string;
    }

    export class YAMLSettingsProvider extends SettingsProvider {
        public constructor(directory: string);

        public readonly directory: string;

        public clear(guild: Guild | string): Promise<void>;
        public init(client: CommandoClient): Promise<void>;
        public remove(guild: Guild | string, key: string): Promise<any>;
        public set(guild: Guild | string, key: string, val: any): Promise<any>;
    }

    type ArgumentCollectorResult = {
        values?: object;
        cancelled?: 'user' | 'time' | 'promptLimit';
        prompts: Message[];
        answers: Message[];
    };

    type ArgumentInfo = {
        key: string;
        label?: string;
        prompt: string;
        type?: string;
        max?: number;
        min?: number;
        default?: any;
        infinite?: boolean;
        validate?: Function;
        parse?: Function;
        wait?: number;
    };

    type ArgumentResult = {
        value: any | any[];
        cancelled?: 'user' | 'time' | 'promptLimit';
        prompts: Message[];
        answers: Message[];
    };

    type CommandGroupResolvable = CommandGroup | string;

    type CommandInfo = {
        name: string;
        aliases?: string[];
        autoAliases?: boolean;
        group: string;
        memberName: string;
        description: string;
        format?: string;
        details?: string;
        examples?: string[];
        guildOnly?: boolean;
        defaultHandling?: boolean;
        throttling?: ThrottlingOptions;
        args?: ArgumentInfo[];
        argsPromptLimit?: number;
        argsType?: string;
        argsCount?: number;
        argsSingleQuotes?: boolean;
        patterns?: RegExp[];
        guarded?: boolean;
        ownerOnly?: boolean;
    };

    type CommandoClientOptions = ClientOptions & {
        selfbot?: boolean;
        commandPrefix?: string;
        commandEditableDuration?: number;
        commandReactableDuration?: number;
        nonCommandEditable?: boolean;
        unknownCommandResponse?: boolean;
        owner?: string | string[] | Set<string>;
        invite?: string;
    };

    type CommandResolvable = Command | string;

    type GroupInfo = {
        id: string;
        name?: string;
        module: string;
        commands?: Command[];
        guarded?: boolean;
    };

    type Inhibitor = (msg: Message) => string | [string, Promise<any>];

    type ModuleResolvable = Module | string;

    type ThrottlingOptions = {
        usages: number;
        duration: number;
    }

    type WorkerInfo = {
        globalEnabledDefault: boolean;
        guarded?: boolean;
        guildEnabledDefault: boolean;
        id: string;
        module: string;
        timer: number;
    };
}
