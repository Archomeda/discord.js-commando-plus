/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../../commands/base');
const { formatFirstLetter } = require('../../../util');

class CommandPing extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'utils',
            module: 'builtin',
            memberName: 'ping',
            throttling: {
                usages: 5,
                duration: 10
            }
        });
    }

    async run(msg) {
        let messageToEdit = msg;
        const isMentioned = msg.channel.type !== 'dm' || messageToEdit.editable;

        if (!messageToEdit.editable) {
            messageToEdit = await msg.reply(this.localization.tl('output.pinging', msg.guild, { cmd: this }));
        } else {
            await messageToEdit.edit(formatFirstLetter(
                this.localization.tl('output.pinging', msg.guild, { cmd: this }), false));
        }

        let content = this.localization.tl('output.pong', msg.guild,
            { cmd: this, time: messageToEdit.createdTimestamp - msg.createdTimestamp });
        if (this.client.ping) {
            content += ` ${this.localization.tl(
                'partial.heartbeat', { cmd: this, time: Math.round(this.client.ping) })}`;
        }
        content = (isMentioned ? `${msg.author}, ` : '') + formatFirstLetter(content, isMentioned);
        return messageToEdit.edit(content);
    }
}

module.exports = CommandPing;
