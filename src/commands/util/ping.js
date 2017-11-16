/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../base');
const { formatFirstLetter } = require('../../util');

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'util',
            memberName: 'ping',
            description: client.localeProvider.tl('help', 'utils.ping.description'),
            throttling: {
                usages: 5,
                duration: 10
            }
        });
    }

    async run(msg) {
        await this.client.localeProvider.preloadNamespace('utils');
        const l10n = this.client.localeProvider;

        let messageToEdit = msg;
        const isMentioned = msg.channel.type !== 'dm' || messageToEdit.editable;

        if (!messageToEdit.editable) {
            messageToEdit = await msg.reply(l10n.tl('utils', 'ping.output-pinging'));
        } else {
            await messageToEdit.edit(formatFirstLetter(l10n.tl('utils', 'ping.output-pinging'), false));
        }

        let content = l10n.tl('utils', 'ping.output-pong',
            { time: messageToEdit.createdTimestamp - msg.createdTimestamp });
        if (this.client.ping) {
            content += ` ${l10n.tl('utils', 'ping.heartbeat', { time: Math.round(this.client.ping) })}`;
        }
        content = (isMentioned ? `${msg.author}, ` : '') + formatFirstLetter(content, isMentioned);
        return messageToEdit.edit(content);
    }
};
