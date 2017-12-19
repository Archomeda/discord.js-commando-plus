#!/usr/bin/env node

/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added use information
 - Added command line arguments
 */

/*
 In order to use this test script, you need to create ./auth.json with token and owner as properties.
 This test script supports a few running modes (defaults to sqlite):
 - ./bot.js sqlite
 - ./bot.js yaml
 */

/* eslint-disable no-console, no-process-env */

// Parse arguments
const mode = process.argv.includes('yaml') ? 'yaml' : 'sqlite';

const commando = require('../src');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const auth = require('./auth');
const i18next = require('i18next');

let sqlite, yaml;
if (mode === 'sqlite') {
    sqlite = require('sqlite');
} else if (mode === 'yaml') {
    yaml = require('js-yaml');
}

const client = new commando.Client({
    owner: auth.owner,
    commandPrefix: 'cdev'
});

client
    .on('error', console.error)
    .on('warn', console.warn)
    .on('debug', console.log)
    .on('ready', () => {
        console.log(`Client ready; logged in as ${client.user.tag} (${client.user.id})`);
    })
    .on('disconnect', () => {
        console.warn('Disconnected!');
    })
    .on('reconnecting', () => {
        console.warn('Reconnecting...');
    })
    .on('commandError', (cmd, err) => {
        if (err instanceof commando.FriendlyError) {
            return;
        }
        console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
    })
    .on('commandBlocked', (msg, reason) => {
        console.log(oneLine`
			Command ${msg.command ? `${msg.command.moduleID}:${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
    })
    .on('commandPrefixChange', (guild, prefix) => {
        console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('commandStatusChange', (guild, command, enabled) => {
        console.log(oneLine`
			Command ${command.moduleID}:${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('groupStatusChange', (guild, group, enabled) => {
        console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    });

client.setLocaleProvider(new commando.I18nextLocaleProvider(i18next));

if (sqlite) {
    client.setSettingsProvider(
        sqlite.open(path.join(__dirname, 'database.sqlite3')).then(db => new commando.SQLiteSettingsProvider(db))
    ).catch(console.error);
} else if (yaml) {
    client.setSettingsProvider(new commando.YAMLSettingsProvider(path.join(__dirname, 'config')))
        .catch(console.error);
}

client.registry
    .registerGroup('math', 'Math')
    .registerDefaults()
    .registerModule(new (require('./module'))(client));

client.login(auth.token);
