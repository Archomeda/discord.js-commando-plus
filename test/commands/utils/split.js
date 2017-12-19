/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed to comply with the Command class changes
 */

const commando = require('../../../src');

class CommandSplit extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'split',
            group: 'utils',
            module: 'test',
            memberName: 'split',
            examples: ['split 3000'],

            args: [
                {
                    key: 'length',
                    type: 'integer',
                    validate: val => parseInt(val) >= 1
                }
            ]
        });
    }

    async run(msg, args) {
        let content = '';
        for (let i = 0; i < args.length; i++) {
            content += `${i % 500 === 0 ? '\n' : ''}a`;
        }
        return [await msg.reply(content, { split: true })];
    }
}

module.exports = CommandSplit;
