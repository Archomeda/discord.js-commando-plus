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
See [installation](https://archomeda.github.io/discord.js-commando-plus/#/docs/commando-plus/master/general/installation).
