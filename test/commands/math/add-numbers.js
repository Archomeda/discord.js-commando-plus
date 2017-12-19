/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed to comply with the Command class changes
 */

const commando = require('../../../src');

class CommandAddNumbers extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'add-numbers',
            aliases: ['add', 'add-nums'],
            group: 'math',
            module: 'test',
            memberName: 'add-numbers',
            examples: ['add-numbers 42 1337'],

            args: [
                {
                    key: 'numbers',
                    label: 'number',
                    type: 'float',
                    infinite: true
                }
            ]
        });
    }

    async run(msg, args) {
        const total = args.numbers.reduce((prev, arg) => prev + parseFloat(arg), 0);
        return msg.reply(`${args.numbers.join(' + ')} = **${total}**`);
    }
}

module.exports = CommandAddNumbers;
