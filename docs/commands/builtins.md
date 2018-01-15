# Built-in commands
Commando-Plus has built-in commands that should be useful for just about any bot.

## Admin (builtin:admin)
### disable (builtin:admin:disable)
Disables a command/group in the current guild if the user is an admin or the bot owner.
If used in a DM, disables the command/group globally by default if the user is the bot owner.

### enable (builtin:admin:enable)
Enables a command/group in the current guild if the user is an admin or the bot owner.
If used in a DM, enables the command/group globally by default if the user is the bot owner.

### load (builtin:admin:load)
Loads a command if the user is the bot owner. The command must be specified as the full name (`group:memberName`).
Built-in commands cannot be loaded.

### groups (builtin:admin:groups)
Lists all command groups if the user is an admin of the current guild, or the bot owner.

### reload (builtin:admin:reload)
Reloads a command, or all commands in a group, if the user is the bot owner.

### unload (builtin:admin:unload)
Unloads a command if the user is the bot owner.
Built-in commands cannot be unloaded.

### workers (builtin:admin:workers)
Lists all workers if the user is an admin of the current guild, or the bot owner.

## Commands (builtin:commands)
### blacklist (builtin:commands:blacklist)
Explicitly blacklists a command to be used in a given guild channel if the user is an admin or the bot owner.
Setting this marks that command to be whitelisted in other channels unless explicitly blacklisted.
If both a blacklist and whitelist are defined, the whitelist has priority.

### clear-whitelist (builtin:commands:clear-whitelist)
Clears the configured whitelist of a command if the user is an admin or the bot owner.

### show-whitelist (builtin:commands:show-whitelist)
Shows the configured whitelist of a command if the user is an admin or the bot owner.

### whitelist (builtin:commands:whitelist)
Explicitly whitelists a command to be used in a given guild channel if the user is an admin or the bot owner.
Setting this marks that command to be blacklisted in other channels unless explicitly whitelisted.
If both a blacklist and whitelist are defined, the whitelist has priority.

## Utility (builtin:util)
### eval (builtin:util:eval)
The eval command will allow the bot owner to evaluate any JavaScript code, and display its result.
It will automatically hide the bot's token/email/password in the output.
Caution should still be taken, however, as you could potentially break your running bot with it.

In the script, `this` will refer to the Command instance.
There are several shortcut variables and helpers that are also available:

| Name             | Type     | Description                                                                        |
|------------------|----------|------------------------------------------------------------------------------------|
| `message`, `msg` | Variable | The message that triggered the command                                             |
| `client`         | Variable | Shortcut to `this.client`                                                          |
| `objects`        | Variable | Shortcut to `this.client.registry.evalObjects`                                     |
| `lastResult`     | Variable | Shortcut to `this.lastResult` (the previous `eval` result value)                   |
| `doReply(val)`   | Function | Sends another detailed message with any value to display. Useful for callbacks.    |

### help (builtin:util:help)
If no arguments are specified, the command displays a list of all commands available in the current context.
In order for a command to be displayed, it must be enabled in the guild (or global), and the user must have permission to use it.
Passing the `all` argument will list all commands, regardless of context.
Passing anything else will search for any commands that match, and display detailed information if only one is found.

### ping (builtin:util:ping)
The ping command will send a message, then edit it to contain the amount of time it took.
It also displays the client's heartbeat ping.

### prefix (builtin:util:prefix)
This command, if not provided with any arguments, will display the current command prefix, and how to use commands.
If the command is used in a guild channel and an argument is specified, it will set the command prefix for the guild if the user is a guild admin, or the bot owner,
If the command is used in a DM and an argument is specified, it will set the global default command prefix if the user is the bot owner.
