/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added ModuleResolvable
 - Added CommandRegistry.modules
 - Added CommandRegistry.findModules()
 - Added CommandRegistry.findWorkers()
 - Added CommandRegistry.registerBuiltInModule()
 - Added CommandRegistry.registerModule()
 - Added CommandRegistry.registerModules()
 - Added CommandRegistry.registerWorker()
 - Added CommandRegistry.registerWorkers()
 - Added CommandRegistry.reregisterWorker()
 - Added CommandRegistry.resolveModule()
 - Added CommandRegistry.resolveWorker()
 - Added CommandRegistry.resolveWorkerPath()
 - Added CommandRegistry.unregisterWorker()
 - Changed signature of CommandRegistry.resolveCommandPath()
 - Removed CommandRegistry.commandsPath
 - Removed CommandRegistry.registerCommandsIn()
 - Removed CommandRegistry.registerDefaultCommands()
 - Removed CommandRegistry.registerDefaultGroups()
 */

const path = require('path');
const discord = require('discord.js');
const Module = require('./module');
const Command = require('./commands/base');
const CommandGroup = require('./commands/group');
const CommandMessage = require('./commands/message');
const ArgumentType = require('./types/base');
const Worker = require('./workers/base');

/**
 * Handles registration and searching of commands and groups.
 */
class CommandRegistry {
    /**
     * @param {CommandoClient} [client] - Client to use
     */
    constructor(client) {
        /**
         * The client this registry is for.
         * @name CommandRegistry#client
         * @type {CommandoClient}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * Registered modules.
         * @type {Collection<string, Module>}
         */
        this.modules = new discord.Collection();

        /**
         * Registered commands.
         * @type {Collection<string, Command>}
         */
        this.commands = new discord.Collection();

        /**
         * Registered command groups.
         * @type {Collection<string, CommandGroup>}
         */
        this.groups = new discord.Collection();

        /**
         * Registered workers.
         * @type {Collection<string, Worker>}
         */
        this.workers = new discord.Collection();

        /**
         * Registered argument types.
         * @type {Collection<string, ArgumentType>}
         */
        this.types = new discord.Collection();

        /**
         * Registered objects for the eval command.
         * @type {Object}
         */
        this.evalObjects = {};
    }

    /**
     * Registers a single module.
     * @param {Module|Function} module - The module instance or constructor
     * @param {...*} [args] - The arguments for the constructor
     * @return {CommandRegistry} This.
     * @see {@link CommandRegistry#registerModules}
     */
    registerModule(module, ...args) {
        if (Array.isArray(args) && args.length > 0) {
            return this.registerModules([[module, args]]);
        }
        return this.registerModules([module]);
    }

    /**
     * Registers multiple modules.
     * @param {Module[]|Function[]|Array[]} modules - An array of module instances or constructors,
     * or an array of [constructor, argsArray].
     * @return {CommandRegistry} This.
     */
    registerModules(modules) {
        if (!Array.isArray(modules)) {
            throw new TypeError('Modules must be an Array.');
        }

        for (let module of modules) {
            let args;
            if (Array.isArray(module)) {
                args = module[1];
                module = module[0];
            }

            if (typeof module === 'function') {
                if (Array.isArray(args)) {
                    module = new module(this.client, ...args); // eslint-disable-line new-cap
                } else {
                    module = new module(this.client); // eslint-disable-line new-cap
                }
            }

            // Verify that it's an actual command
            if (!(module instanceof Module)) {
                this.client.emit('warn', `Attempting to register an invalid module object: ${module}; skipping.`);
                continue;
            }

            if (this.modules.has(module.id)) {
                throw new Error(`A module with id "${module.id}" is already registered.`);
            }

            this.modules.set(module.id, module);
            /**
             * Emitted when a module is registered.
             * @event CommandoClient#moduleRegister
             * @param {Module} module - Module that was registered
             * @param {CommandRegistry} registry - Registry that the module was registered to
             */
            this.client.emit('moduleRegister', module, this);
            this.client.emit('debug', `Registered module ${module.id}.`);

            this.registerGroups(module.groups);
            this.registerCommands(module.commands.array());
            for (const command of module.commands) {
                command.module = module;
            }
            this.registerWorkers(module.workers.array());
            for (const worker of module.workers) {
                worker.module = module;
            }
        }
        return this;
    }

    /**
     * Registers a single group.
     * @param {CommandGroup|Function|string[]|string} group - A CommandGroup instance, a constructor,
     * an array of [ID, Name], or the group ID
     * @param {string} [name] - Name for the group (if the first argument is the group ID)
     * @return {CommandRegistry} This.
     * @see {@link CommandRegistry#registerGroups}
     */
    registerGroup(group, name) {
        if (typeof group === 'string') {
            return this.registerGroups([[group, name]]);
        }
        return this.registerGroups([group]);
    }

    /**
     * Registers multiple groups.
     * @param {CommandGroup[]|Function[]|Array<string[]>} groups - An array of CommandGroup instances, constructors,
     * or arrays of [ID, Name]
     * @return {CommandRegistry} This.
     */
    registerGroups(groups) {
        if (!Array.isArray(groups)) {
            throw new TypeError('Groups must be an Array.');
        }
        for (let group of groups) {
            if (typeof group === 'function') {
                group = new group(this.client); // eslint-disable-line new-cap
            } else if (Array.isArray(group)) {
                group = new CommandGroup(this.client, ...group);
            } else if (!(group instanceof CommandGroup)) {
                group = new CommandGroup(this.client, group.id, group.name, null, group.commands);
            }

            const existing = this.groups.get(group.id);
            if (existing) {
                this.client.emit('debug', `Group ${group.id} is already registered; skipping.`);
            } else {
                this.groups.set(group.id, group);
                /**
                 * Emitted when a group is registered.
                 * @event CommandoClient#groupRegister
                 * @param {CommandGroup} group - Group that was registered
                 * @param {CommandRegistry} registry - Registry that the group was registered to
                 */
                this.client.emit('groupRegister', group, this);
                this.client.emit('debug', `Registered group ${group.id}.`);
            }
        }
        return this;
    }

    /**
     * Registers a single command.
     * @param {Command|Function} command - Either a Command instance, or a constructor for one
     * @return {CommandRegistry} This.
     * @see {@link CommandRegistry#registerCommands}
     */
    registerCommand(command) {
        return this.registerCommands([command]);
    }

    /**
     * Registers multiple commands.
     * @param {Command[]|Function[]} commands - An array of Command instances or constructors
     * @return {CommandRegistry} This.
     */
    registerCommands(commands) {
        if (!Array.isArray(commands)) {
            throw new TypeError('Commands must be an Array.');
        }
        for (let command of commands) {
            if (typeof command === 'function') {
                command = new command(this.client); // eslint-disable-line new-cap
            }

            // Verify that it's an actual command
            if (!(command instanceof Command)) {
                this.client.emit('warn', `Attempting to register an invalid command object: ${command}; skipping.`);
                continue;
            }

            // Make sure there aren't any conflicts
            if (this.commands.some(cmd => cmd.name === command.name || cmd.aliases.includes(command.name))) {
                throw new Error(`A command with the name/alias "${command.name}" is already registered.`);
            }
            for (const alias of command.aliases) {
                if (this.commands.some(cmd => cmd.name === alias || cmd.aliases.includes(alias))) {
                    throw new Error(`A command with the name/alias "${alias}" is already registered.`);
                }
            }
            const group = this.groups.find(grp => grp.id === command.groupID);
            if (!group) {
                throw new Error(`Group "${command.groupID}" is not registered.`);
            }
            if (group.commands.some(cmd => cmd.memberName === command.memberName)) {
                throw new Error(
                    `A command with the member name "${command.memberName}" is already registered in ${group.id}`);
            }

            // Add the command
            command.group = group;
            group.commands.set(command.name, command);
            this.commands.set(command.name, command);
            /**
             * Emitted when a command is registered.
             * @event CommandoClient#commandRegister
             * @param {Command} command - Command that was registered
             * @param {CommandRegistry} registry - Registry that the command was registered to
             */
            this.client.emit('commandRegister', command, this);
            this.client.emit('debug', `Registered command ${group.id}:${command.memberName}.`);
        }

        return this;
    }

    /**
     * Reregisters a command (does not support changing name, group, module or memberName).
     * @param {Command|Function} command - New command
     * @param {Command} oldCommand - Old command
     * @return {void}
     */
    reregisterCommand(command, oldCommand) {
        if (typeof command === 'function') {
            command = new command(this.client); // eslint-disable-line new-cap
        }
        if (command.name !== oldCommand.name) {
            throw new Error('Command name cannot change.');
        }
        if (command.groupID !== oldCommand.groupID) {
            throw new Error('Command group cannot change.');
        }
        if (command.moduleID !== oldCommand.moduleID) {
            throw new Error('Command module cannot change.');
        }
        if (command.memberName !== oldCommand.memberName) {
            throw new Error('Command memberName cannot change.');
        }
        command.group = this.resolveGroup(command.groupID);
        command.group.commands.set(command.name, command);
        command.module = this.resolveModule(command.moduleID);
        command.module.commands.set(command.name, command);
        this.commands.set(command.name, command);
        /**
         * Emitted when a command is reregistered.
         * @event CommandoClient#commandReregister
         * @param {Command} newCommand - New command
         * @param {Command} oldCommand - Old command
         */
        this.client.emit('commandReregister', command, oldCommand);
        this.client.emit('debug', `Reregistered command ${command.moduleID}:${command.groupID}:${command.memberName}.`);
    }

    /**
     * Unregisters a command.
     * @param {Command} command - Command to unregister
     * @return {void}
     */
    unregisterCommand(command) {
        this.commands.delete(command.name);
        command.group.commands.delete(command.name);
        command.module.commands.delete(command.name);
        /**
         * Emitted when a command is unregistered.
         * @event CommandoClient#commandUnregister
         * @param {Command} command - Command that was unregistered
         */
        this.client.emit('commandUnregister', command);
        this.client.emit('debug', `Unregistered command ${command.moduleID}:${command.groupID}:${command.memberName}.`);
    }

    /**
     * Registers a single object to be usable by the eval command.
     * @param {string} key - The key for the object
     * @param {Object} obj - The object
     * @return {CommandRegistry} This.
     * @see {@link CommandRegistry#registerEvalObjects}
     */
    registerEvalObject(key, obj) {
        const registerObj = {};
        registerObj[key] = obj;
        return this.registerEvalObjects(registerObj);
    }

    /**
     * Registers multiple objects to be usable by the eval command.
     * @param {Object} obj - An object of keys: values
     * @return {CommandRegistry} This.
     */
    registerEvalObjects(obj) {
        Object.assign(this.evalObjects, obj);
        return this;
    }

    /**
     * Registers a single worker.
     * @param {Worker|Function} worker - Either a worker instance, or a constructor for one
     * @return {CommandRegistry} Itself.
     */
    registerWorker(worker) {
        return this.registerWorkers([worker]);
    }

    /**
     * Registers multiple workers.
     * @param {Worker[]|Function[]} workers - An array of worker instances or constructors
     * @return {CommandRegistry} Itself.
     */
    registerWorkers(workers) {
        if (!Array.isArray(workers)) {
            throw new TypeError('The parameter modules must be an array');
        }

        for (let worker of workers) {
            if (typeof worker === 'function') {
                worker = new worker(this.client); // eslint-disable-line new-cap
            }

            // Verify that it's an actual worker
            if (!(worker instanceof Worker)) {
                this.client.emit('warn', `Attempting to register an invalid worker object: ${worker}; skipping`);
                continue;
            }

            // Make sure there aren't any conflicts
            if (this.workers.some(w => w.id === worker.id)) {
                throw new Error(`A worker with the id "${worker.id}" is already registered`);
            }

            // Add the worker
            this.workers.set(worker.id, worker);
            /**
             * Emitted when a worker is registered.
             * @event CommandoClient#workerRegister
             * @param {Worker} worker - The worker that was registered
             * @param {Registry} registry - The registry that the worker was registered to
             */
            this.client.emit('workerRegister', worker, this);
            this.client.emit('debug', `Registered worker ${worker.id}.`);

            // Start the worker if it's configured to be active
            if (this.client.settingsProvider && this.client.settings.get(`wkr-${worker.id}`)) {
                worker.start();
            }
        }

        return this;
    }

    /**
     * Reregisters a worker (does not support changing id).
     * @param {Worker|Function} worker - The worker
     * @param {Worker} oldWorker - The old worker
     * @return {void}
     */
    reregisterWorker(worker, oldWorker) {
        if (typeof worker === 'function') {
            worker = new worker(this.client); // eslint-disable-line new-cap
        }
        if (worker.id !== oldWorker.id) {
            throw new Error('Worker id cannot change');
        }
        worker._globalEnabled = oldWorker._globalEnabled;
        this.workers.set(worker.id, worker);
        /**
         * Emitted when a worker is reregistered.
         * @event CommandoClient#workerReregister
         * @param {Worker} newWorker - The new worker
         * @param {Worker} oldWorker - The old worker
         */
        this.client.emit('workerReregister', worker, oldWorker);
        this.client.emit('debug', `Reregistered worker ${worker.id}`);

        // Start the worker again if it was running before
        if (worker._globalEnabled) {
            worker.start();
        }
    }

    /**
     * Unregisters a worker.
     * @param {Worker} worker - The worker to unregister
     * @return {void}
     */
    unregisterWorker(worker) {
        this.workers.delete(worker.id);
        /**
         * Emitted when a worker is unregistered.
         * @event CommandoClient#workerUnregister
         * @param {Worker} worker - The worker that was unregistered
         */
        this.client.emit('workerUnregister', worker);
        this.client.emit('debug', `Unregistered worker ${worker.id}.`);
    }

    /**
     * Registers a single argument type.
     * @param {ArgumentType|Function} type - Either an ArgumentType instance, or a constructor for one
     * @return {CommandRegistry} This.
     * @see {@link CommandRegistry#registerTypes}
     */
    registerType(type) {
        return this.registerTypes([type]);
    }

    /**
     * Registers multiple argument types.
     * @param {ArgumentType[]|Function[]} types - An array of ArgumentType instances or constructors
     * @return {CommandRegistry} This.
     */
    registerTypes(types) {
        if (!Array.isArray(types)) {
            throw new TypeError('Types must be an Array.');
        }
        for (let type of types) {
            if (typeof type === 'function') {
                type = new type(this.client); // eslint-disable-line new-cap
            }

            // Verify that it's an actual type
            if (!(type instanceof ArgumentType)) {
                this.client.emit('warn', `Attempting to register an invalid argument type object: ${type}; skipping.`);
                continue;
            }

            // Make sure there aren't any conflicts
            if (this.types.has(type.id)) {
                throw new Error(`An argument type with the ID "${type.id}" is already registered.`);
            }

            // Add the type
            this.types.set(type.id, type);
            /**
             * Emitted when an argument type is registered.
             * @event CommandoClient#typeRegister
             * @param {ArgumentType} type - Argument type that was registered
             * @param {CommandRegistry} registry - Registry that the type was registered to
             */
            this.client.emit('typeRegister', type, this);
            this.client.emit('debug', `Registered argument type ${type.id}.`);
        }

        return this;
    }

    /**
     * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
     * @param {string|RequireAllOptions} options - The path to the directory, or a require-all options object
     * @return {CommandRegistry} This.
     */
    registerTypesIn(options) {
        const obj = require('require-all')(options);
        const types = [];
        for (const type of Object.values(obj)) {
            types.push(type);
        }
        return this.registerTypes(types);
    }

    /**
     * Registers the default argument types, groups, and commands.
     * @return {CommandRegistry} This.
     */
    registerDefaults() {
        this.registerDefaultTypes();
        this.registerBuiltInModule();
        return this;
    }

    /**
     * Registers the default built-in module with its groups and commands to the registry.
     * @param {Object} [commandsToLoad] - Describes which commands to load
     * @param {boolean} commandsToLoad.disable - The admin:disable command
     * @param {boolean} commandsToLoad.enable - The admin:enable command
     * @param {boolean} commandsToLoad.load - The admin:load command
     * @param {boolean} commandsToLoad.reload - The admin:reload command
     * @param {boolean} commandsToLoad.unload - The admin:unload command
     * @param {boolean} commandsToLoad.workers - The admin:workers command
     * @param {boolean} commandsToLoad.blacklist - The commands:blacklist command
     * @param {boolean} commandsToLoad.clear-whitelist - The commands:clear-whitelist command
     * @param {boolean} commandsToLoad.groups - The commands:groups command
     * @param {boolean} commandsToLoad.show-whitelist - The commands:show-whitelist command
     * @param {boolean} commandsToLoad.whitelist - The commands:whitelist command
     * @param {boolean} commandsToLoad.eval - The utils:eval command
     * @param {boolean} commandsToLoad.help - The utils:help command
     * @param {boolean} commandsToLoad.ping - The utils:ping command
     * @param {boolean} commandsToLoad.prefix - The utils:prefix command
     * @return {CommandRegistry} This.
     */
    registerBuiltInModule(commandsToLoad) {
        return this.registerModule(require('./builtin/module'), commandsToLoad);
    }

    /**
     * Registers the default argument types to the registry. These are:
     * - string
     * - integer
     * - float
     * - boolean
     * - user
     * - member
     * - role
     * - channel
     * - message
     * - command
     * - group
     * - command-or-group
     * - worker
     * - command-or-worker
     * - command-or-group-or-worker
     * @return {CommandRegistry} This.
     */
    registerDefaultTypes() {
        this.registerTypes([
            require('./types/string'),
            require('./types/integer'),
            require('./types/float'),
            require('./types/boolean'),
            require('./types/user'),
            require('./types/member'),
            require('./types/role'),
            require('./types/channel'),
            require('./types/message'),
            require('./types/command'),
            require('./types/group'),
            require('./types/command-or-group'),
            require('./types/worker'),
            require('./types/command-or-worker'),
            require('./types/command-or-group-or-worker')
        ]);
        return this;
    }

    /**
     * Finds all modules that match the search string.
     * @param {string} [searchString] - The string to search for
     * @param {boolean} [exact=false] - Whether the search should be exact
     * @return {Module[]} All modules that are found.
     */
    findModules(searchString = null, exact = false) {
        if (!searchString) {
            return this.modules;
        }

        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedGroups = this.modules.filterArray(
            exact ? moduleFilterExact(lcSearch) : moduleFilterInexact(lcSearch)
        );
        if (exact) {
            return matchedGroups;
        }

        // See if there's an exact match
        for (const module of matchedGroups) {
            if (module.id === lcSearch) {
                return [module];
            }
        }
        return matchedGroups;
    }

    /**
     * A ModuleResolvable can be:
     * * A Module
     * * A module ID
     * @typedef {Module|string} ModuleResolvable
     */

    /**
     * Resolves a ModuleResolvable to a Module object.
     * @param {ModuleResolvable} module - The module to resolve
     * @return {Module} The resolved Module.
     */
    resolveModule(module) {
        if (module instanceof Module) {
            return module;
        }
        if (typeof module === 'string') {
            const modules = this.findModules(module, true);
            if (modules.length === 1) {
                return modules[0];
            }
        }
        throw new Error('Unable to resolve module.');
    }

    /**
     * Finds all groups that match the search string.
     * @param {string} [searchString] - The string to search for
     * @param {boolean} [exact=false] - Whether the search should be exact
     * @return {CommandGroup[]} All groups that are found.
     */
    findGroups(searchString = null, exact = false) {
        if (!searchString) {
            return this.groups;
        }

        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedGroups = this.groups.filterArray(
            exact ? groupFilterExact(lcSearch) : groupFilterInexact(lcSearch)
        );
        if (exact) {
            return matchedGroups;
        }

        // See if there's an exact match
        for (const group of matchedGroups) {
            if (group.name.toLowerCase() === lcSearch || group.id === lcSearch) {
                return [group];
            }
        }
        return matchedGroups;
    }

    /**
     * A CommandGroupResolvable can be:
     * * A CommandGroup
     * * A group ID
     * @typedef {CommandGroup|string} CommandGroupResolvable
     */

    /**
     * Resolves a CommandGroupResolvable to a CommandGroup object.
     * @param {CommandGroupResolvable} group - The group to resolve
     * @return {CommandGroup} The resolved CommandGroup.
     */
    resolveGroup(group) {
        if (group instanceof CommandGroup) {
            return group;
        }
        if (typeof group === 'string') {
            const groups = this.findGroups(group, true);
            if (groups.length === 1) {
                return groups[0];
            }
        }
        throw new Error('Unable to resolve group.');
    }

    /**
     * Finds all commands that match the search string.
     * @param {string} [searchString] - The string to search for
     * @param {boolean} [exact=false] - Whether the search should be exact
     * @param {Message} [message] - The message to check usability against
     * @return {Command[]} All commands that are found.
     */
    findCommands(searchString = null, exact = false, message = null) {
        if (!searchString) {
            return message ? this.commands.filterArray(cmd => cmd.isUsable(message)) : this.commands;
        }

        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedCommands = this.commands.filterArray(
            exact ? commandFilterExact(lcSearch) : commandFilterInexact(lcSearch)
        );
        if (exact) {
            return matchedCommands;
        }

        // See if there's an exact match
        for (const command of matchedCommands) {
            if (command.name === lcSearch || (command.aliases && command.aliases.some(ali => ali === lcSearch))) {
                return [command];
            }
        }

        return matchedCommands;
    }

    /**
     * A CommandResolvable can be:
     * * A Command
     * * A command name
     * * A CommandMessage
     * @typedef {Command|string} CommandResolvable
     */

    /**
     * Resolves a CommandResolvable to a Command object.
     * @param {CommandResolvable} command - The command to resolve
     * @return {Command} The resolved Command.
     */
    resolveCommand(command) {
        if (command instanceof Command) {
            return command;
        }
        if (command instanceof CommandMessage) {
            return command.command;
        }
        if (typeof command === 'string') {
            const commands = this.findCommands(command, true);
            if (commands.length === 1) {
                return commands[0];
            }
        }
        throw new Error('Unable to resolve command.');
    }

    /**
     * Resolves a command file path from a command's group ID and memberName.
     * @param {ModuleResolvable} module - The module
     * @param {string} group - ID of the command's group
     * @param {string} memberName - Member name of the command
     * @return {string} Fully-resolved path to the corresponding command file.
     */
    resolveCommandPath(module, group, memberName) {
        module = this.resolveModule(module);
        return path.join(module.commandsDirectory, group, `${memberName}.js`);
    }

    /**
     * Finds all workers that match the search string.
     * @param {?string} [searchString] - The string to search for
     * @param {boolean} [exact = false] - Whether the search should be exact
     * @return {Worker[]} All workers that are found.
     */
    findWorkers(searchString = null, exact = false) {
        if (!searchString) {
            return Array.from(this.workers);
        }

        // Find all matches
        const lcSearch = searchString.toLowerCase();
        const matchedWorkers = this.workers.filterArray(
            exact ? workerFilterExact(lcSearch) : workerFilterInexact(lcSearch)
        );
        if (exact) {
            return matchedWorkers;
        }

        // See if there's an exact match
        for (const worker of matchedWorkers) {
            if (worker.id.toLowerCase() === lcSearch) {
                return [worker];
            }
        }
        return matchedWorkers;
    }

    /**
     * A WorkerResolvable can be:
     * * A Worker
     * * A worker id
     * @typedef {Worker|string} WorkerResolvable
     */

    /**
     * Resolves a WorkerResolver to a Worker object.
     * @param {WorkerResolvable} worker - The worker to resolve
     * @return {Worker} The resolved worker.
     */
    resolveWorker(worker) {
        if (worker instanceof Worker) {
            return worker;
        }
        if (typeof worker === 'string') {
            const workers = this.findWorkers(worker, true);
            if (workers.length === 1) {
                return workers[0];
            }
        }
        throw new Error('Unable to resolve worker.');
    }

    /**
     * Resolves a worker file path from a worker ID.
     * @param {ModuleResolvable} module - The module
     * @param {string} workerId - ID of the worker
     * @return {string} Fully-resolved path to the corresponding worker file.
     */
    resolveWorkerPath(module, workerId) {
        module = this.resolveModule(module);
        return path.join(module.workersDirectory, `${workerId}.js`);
    }
}

function moduleFilterExact(search) {
    return m => m.id === search;
}

function moduleFilterInexact(search) {
    return m => m.id.includes(search);
}

function groupFilterExact(search) {
    return grp => grp.id === search || grp.name.toLowerCase() === search;
}

function groupFilterInexact(search) {
    return grp => grp.id.includes(search) || grp.name.toLowerCase().includes(search);
}

function commandFilterExact(search) {
    return cmd => cmd.name === search ||
    (cmd.aliases && cmd.aliases.some(ali => ali === search)) ||
    `${cmd.groupID}:${cmd.memberName}` === search;
}

function commandFilterInexact(search) {
    return cmd => cmd.name.includes(search) ||
    `${cmd.groupID}:${cmd.memberName}` === search ||
    (cmd.aliases && cmd.aliases.some(ali => ali.includes(search)));
}

function workerFilterExact(search) {
    return w => w.id === search;
}

function workerFilterInexact(search) {
    return w => w.id.includes(search);
}

module.exports = CommandRegistry;
