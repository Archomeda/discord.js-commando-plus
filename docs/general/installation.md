# Installation
**Node 8.0.0 or newer is required.**  
Commando-Plus supports additional features that have peer dependencies that need to be installed separately.

Install Commando-Plus by running: `npm install archomeda/discord.js-commando-plus --save`

## Settings (required)
Create your own [SettingsProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/SettingsProvider),
or use:
 - [SQLiteSettingsProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/SQLiteSettingsProvider): `npm install sqlite --save`
 - [YAMLSettingsProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/YAMLSettingsProvider): `npm install js-yaml --save`

## Localization (required)
Create your own [LocaleProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/LocaleProvider),
or use:
 - [I18nextLocaleProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/I18nextLocaleProvider): `npm install i18next i18next-node-fs-backend --save`

## Caching (optional)
Create your own [CacheProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/CacheProvider),
or use:
 - [MemoryCacheProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/MemoryCacheProvider): `npm install node-cache --save`
 - [RedisCacheProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/RedisCacheProvider): `npm install redis --save`

When using the RedisCacheProvider, Redis 3.2 is required as an additional dependency.

## Database storage (optional)
Create your own [StorageProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/StorageProvider),
or use:
 - [MongoStorageProvider](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/class/MongoStorageProvider): `npm install mongoose --save`

When using the MongoStorageProvider, MongoDB 3.4 is required as an additional dependency.
