/*
  Original author: Archomeda
 */

const path = require('path');
const Module = require('../../module');

class BuiltInModule extends Module {
    constructor(client, commandsToLoad) { // eslint-disable-line complexity
        const toLoad = [];
        /* eslint-disable max-len */
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.disable === 'undefined' || commandsToLoad.disable) {
            toLoad.push(new (require('./commands/disable'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.enable === 'undefined' || commandsToLoad.enable) {
            toLoad.push(new (require('./commands/enable'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.groups === 'undefined' || commandsToLoad.groups) {
            toLoad.push(new (require('./commands/groups'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.load === 'undefined' || commandsToLoad.load) {
            toLoad.push(new (require('./commands/load'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.reload === 'undefined' || commandsToLoad.reload) {
            toLoad.push(new (require('./commands/reload'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.unload === 'undefined' || commandsToLoad.unload) {
            toLoad.push(new (require('./commands/unload'))(client));
        }

        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.eval === 'undefined' || commandsToLoad.eval) {
            toLoad.push(new (require('./utils/eval'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.help === 'undefined' || commandsToLoad.help) {
            toLoad.push(new (require('./utils/help'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.ping === 'undefined' || commandsToLoad.ping) {
            toLoad.push(new (require('./utils/ping'))(client));
        }
        if (typeof commandsToLoad === 'undefined' || typeof commandsToLoad.prefix === 'undefined' || commandsToLoad.prefix) {
            toLoad.push(new (require('./utils/prefix'))(client));
        }
        /* eslint-enable max-len */

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
