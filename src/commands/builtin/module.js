/*
  Original author: Archomeda
 */

const path = require('path');
const Module = require('../../module');

class BuiltInModule extends Module {
    constructor(client, commandsToLoad) { // eslint-disable-line complexity
        const toLoad = [];
        const check = id =>
            typeof commandsToLoad === 'undefined' || typeof commandsToLoad[id] === 'undefined' || commandsToLoad[id];

        if (check('disable')) {
            toLoad.push(new (require('./commands/disable'))(client));
        }
        if (check('enable')) {
            toLoad.push(new (require('./commands/enable'))(client));
        }
        if (check('groups')) {
            toLoad.push(new (require('./commands/groups'))(client));
        }
        if (check('load')) {
            toLoad.push(new (require('./commands/load'))(client));
        }
        if (check('reload')) {
            toLoad.push(new (require('./commands/reload'))(client));
        }
        if (check('unload')) {
            toLoad.push(new (require('./commands/unload'))(client));
        }

        if (check('eval')) {
            toLoad.push(new (require('./utils/eval'))(client));
        }
        if (check('help')) {
            toLoad.push(new (require('./utils/help'))(client));
        }
        if (check('ping')) {
            toLoad.push(new (require('./utils/ping'))(client));
        }
        if (check('prefix')) {
            toLoad.push(new (require('./utils/prefix'))(client));
        }

        super(client, {
            id: 'builtin',
            commands: toLoad,
            groups: [
                ['commands', 'Commands'],
                ['utils', 'Utilities']
            ],
            commandsDirectory: __dirname,
            localizationDirectory: path.join(__dirname, '../../locales')
        });
    }
}

module.exports = BuiltInModule;
