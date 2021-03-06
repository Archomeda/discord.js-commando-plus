# Commando-Plus
[![Dependency status](https://david-dm.org/Archomeda/discord.js-commando-plus.svg)](https://david-dm.org/Archomeda/discord.js-commando-plus)
[![peerDependencies status](https://david-dm.org/Archomeda/discord.js-commando-plus/peer-status.svg)](https://david-dm.org/Archomeda/discord.js-commando-plus?type=peer)
[![Build status](https://travis-ci.org/Archomeda/discord.js-commando-plus.svg)](https://travis-ci.org/Archomeda/discord.js-commando-plus)

**This is still a work in progress.**

## About
Commando-Plus extends on [Commando](https://github.com/discordjs/Commando). Info snippet from Commando:
> It is flexible, fully object-oriented, easy to use, and makes it trivial to create your own powerful commands.
Additionally, it makes full use of ES2017's `async`/`await` functionality for clear, concise code that is simple to write and easy to comprehend.

If you are looking for better support, and do not plan to use any of the features of Commando-Plus, please use Commando instead.
This repository is mostly here to support my own Discord bots in order to share common used code between them without having to manually duplicate them in every repository.

## Features on top of Commando
- Easily extendable commands through third-party modules
- Command responses can handle reactions
- Limit commands to certain server channels (configurable through whitelisting commands)
- Background workers
- Supports caching with the Memory and Redis providers
- Supports database storage with the MongoDB provider
- Supports localization with the i18next provider (default locale is en-US)
- Supports an additional settings provider: YAML

## Installation
**Node 8.0 or higher is required.**  
If you are using Node 8.2 or lower, you might have to run node with the harmony flag.

Commando-Plus supports additional features that have peer dependencies that need to be installed separately.

Install Commando-Plus by running: `npm install archomeda/discord.js-commando-plus --save`

### Settings (required)
Create your own [SettingsProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/SettingsProvider),
or use:
 - [SQLiteSettingsProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/SQLiteSettingsProvider): `npm install sqlite --save`
 - [YAMLSettingsProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/YAMLSettingsProvider): `npm install js-yaml --save`

### Localization (required)
Create your own [LocaleProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/LocaleProvider),
or use:
 - [I18nextLocaleProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/I18nextLocaleProvider): `npm install i18next --save`

### Caching (optional)
Create your own [CacheProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/CacheProvider),
or use:
 - [MemoryCacheProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/MemoryCacheProvider): `npm install node-cache --save`
 - [RedisCacheProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/RedisCacheProvider): `npm install redis --save`

When using the RedisCacheProvider, Redis 3.2 is required as an additional dependency.

### Database storage (optional)
Create your own [StorageProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/StorageProvider),
or use:
 - [MongoStorageProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/MongoStorageProvider): `npm install mongoose --save`

When using the MongoStorageProvider, MongoDB 3.4 is required as an additional dependency.

## Documentation
- [Commando-Plus documentation](https://archomeda.github.io/discord.js-commando-plus)
- [discord.js documentation](https://discord.js.org/#/docs)
