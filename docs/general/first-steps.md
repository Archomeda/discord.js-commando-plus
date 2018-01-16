# First steps
The first thing you need to do to use Commando-Plus is ensure you're creating a [CommandoClient](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/CommandoClient)
rather than the regular discord.js [Client](https://discord.js.org/#/docs/main/master/class/Client).
A CommandoClient is just an extension of the base Client, so all options, properties, methods, and events on Client are also on CommandoClient.

You should provide the `owner` option to the constructor, which is an option specific to CommandoClient, and should be set to the ID of your Discord user.
This will give you full access to control everything about the bot, in any guild.

```js
const Commando = require('discord.js-commando-plus');

const client = new Commando.Client({
    owner: '1234567890'
});
```

Then, to make use of the command framework, you need to create a module that will contain your commands and command groups.
Refer to the source of the [built-in module](https://github.com/Archomeda/discord.js-commando-plus/tree/master/src/commands/builtin/module.js) as a working example, or see below for a simplified example: 

```js
const path = require('path');

class YourModule extends Commando.Module {
    constructor(client) {
        super(client, {
            id: 'module-id',
            commands: [
                require('a/path/to/a/command'),
                require('a/second/path/to/a/command'),
                require('etc/etc/command')
            ],
            groups: [
                'a-group',
                'a-second-group'
            ],
            workers: [
                require('a/path/to/a/worker'),
                require('a/second/path/to/a/worker')
            ],
            commandsDirectory: __dirname,
            workersDirectory: __dirname,
            localizationDirectory: path.join(__dirname, 'locales')
        });
    }
}

// Now register it with the client
client.registerModule(YourModule);

// You can register additional argument types here if needed, along with the defaults
client.registerDefaults();
```

Commando-Plus has built-in command prefix configuration per-guild, as well as enabling and disabling commands per-guild.
In order for this to persist across restarts, you should use a [SettingsProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/SettingsProvider).
There are two built-in settings providers:
- SQLiteSettingsProvider that stores all settings in an SQLite3 database
- YAMLSettingsProvider that stores all settings in per-guild YAML files

As an example for the SQLiteSettingsProvider, in order to use it, install the `sqlite` package with NPM (`npm install sqlite --save`).
Then, set the settings provider on the client:

```js
const sqlite = require('sqlite');

client.setSettingsProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);
```

Commando-Plus requires you to use a localization backend.
It comes with a built-in I18nextLocaleProvider that uses i18next as localization backend.
Install the `i18next` package with NPM (`npm install i18next --save`).
Then, set the locale provider on the client:

```js
const i18next = require('i18next');

client.setLocaleProvider(
    new Commando.I18nextLocaleProvider(i18next)
).catch(console.error);
```

Finally, you must log in, just as if you were using a regular Client.

```js
client.login('token goes here');
```

There is an extremely simple example bot used to test Commando-Plus, of which you can view the source [here](https://github.com/Archomeda/discord.js-commando-plus/tree/master/test).
