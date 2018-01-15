/*
  Original author: Archomeda
 */

const path = require('path');
const Module = require('../module');

class BuiltInModule extends Module {
    constructor(client, commandsToLoad) { // eslint-disable-line complexity
        const toLoad = [];
        const check = id =>
            typeof commandsToLoad === 'undefined' || typeof commandsToLoad[id] === 'undefined' || commandsToLoad[id];

        if (check('blacklist')) {
            toLoad.push(new (require('./commands/commands/blacklist'))(client));
        }
        if (check('clear-whitelist')) {
            toLoad.push(new (require('./commands/commands/clear-whitelist'))(client));
        }
        if (check('disable')) {
            toLoad.push(new (require('./commands/commands/disable'))(client));
        }
        if (check('enable')) {
            toLoad.push(new (require('./commands/commands/enable'))(client));
        }
        if (check('groups')) {
            toLoad.push(new (require('./commands/commands/groups'))(client));
        }
        if (check('load')) {
            toLoad.push(new (require('./commands/commands/load'))(client));
        }
        if (check('reload')) {
            toLoad.push(new (require('./commands/commands/reload'))(client));
        }
        if (check('show-whitelist')) {
            toLoad.push(new (require('./commands/commands/show-whitelist'))(client));
        }
        if (check('unload')) {
            toLoad.push(new (require('./commands/commands/unload'))(client));
        }
        if (check('whitelist')) {
            toLoad.push(new (require('./commands/commands/whitelist'))(client));
        }

        if (check('eval')) {
            toLoad.push(new (require('./commands/utils/eval'))(client));
        }
        if (check('help')) {
            toLoad.push(new (require('./commands/utils/help'))(client));
        }
        if (check('ping')) {
            toLoad.push(new (require('./commands/utils/ping'))(client));
        }
        if (check('prefix')) {
            toLoad.push(new (require('./commands/utils/prefix'))(client));
        }

        super(client, {
            id: 'builtin',
            commands: toLoad,
            groups: [
                ['commands', 'Commands'],
                ['utils', 'Utilities']
            ],
            commandsDirectory: path.join(__dirname, 'commands'),
            workersDirectory: path.join(__dirname, 'workers'),
            localizationDirectory: path.join(__dirname, '../locales')
        });
    }
}

module.exports = BuiltInModule;
