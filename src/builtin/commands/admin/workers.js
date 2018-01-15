/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../../commands/base');

class CommandWorkers extends Command {
    constructor(client) {
        super(client, {
            name: 'workers',
            aliases: ['list-workers', 'show-workers'],
            group: 'admin',
            module: 'builtin',
            memberName: 'workers',
            guarded: true
        });
    }

    hasPermission(msg) {
        if (!msg.guild) {
            return this.client.isOwner(msg.author);
        }
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }

    run(msg) {
        let content = `\n__**${this.localization.tl('output.header', msg.guild, { cmd: this })}**__\n`;
        content += this.client.registry.workers.map(w =>
            `**${w.id}:** ${w.isEnabledIn(msg.guild) ?
                this.localization.tl('partial.enabled', msg.guild, { cmd: this }) :
                this.localization.tl('partial.disabled', msg.guild, { cmd: this })}`)
            .join('\n');
        return msg.reply(content);
    }
}

module.exports = CommandWorkers;
