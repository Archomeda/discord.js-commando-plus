/*
 Original author: Archomeda
 */

const path = require('path');
const Module = require('../src/module');

class TestModule extends Module {
    constructor(client) {
        const commands = [
            new (require('./commands/math/add-numbers'))(client),
            new (require('./commands/utils/channel'))(client),
            new (require('./commands/utils/split'))(client),
            new (require('./commands/utils/user-info'))(client)
        ];
        const workers = [
            new (require('./workers/print-guilds'))(client)
        ];
        super(client, {
            id: 'test',
            commands,
            groups: [
                ['math', 'Math'],
                ['utils', 'Utilities']
            ],
            workers,
            commandsDirectory: path.join(__dirname, 'commands'),
            workersDirectory: path.join(__dirname, 'workers'),
            localizationDirectory: path.join(__dirname, 'locales')
        });
    }
}

module.exports = TestModule;
