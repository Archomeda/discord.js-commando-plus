/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed to comply with the Command class changes
 */

const commando = require('../../../src');

class CommandChannel extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'channel',
            aliases: ['chan'],
            group: 'utils',
            module: 'test',
            memberName: 'channel',
            examples: ['channel #test', 'channel test'],
            guildOnly: true,

            args: [
                {
                    key: 'channel',
                    label: 'textchannel',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, args) {
        const channel = args.channel;
        return msg.reply(channel);
    }
}

module.exports = CommandChannel;
