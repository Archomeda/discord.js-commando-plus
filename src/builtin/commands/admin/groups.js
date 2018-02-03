/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../../commands/base');

class CommandGroups extends Command {
    constructor(client) {
        super(client, {
            name: 'groups',
            aliases: ['list-groups', 'show-groups'],
            group: 'admin',
            module: 'builtin',
            memberName: 'groups',
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
        content += this.client.registry.groups.map(g =>
            `**${g.module.localization.tl('groups', g.name, msg.guild)}:** ${g.isEnabledIn(msg.guild) ?
                this.localization.tl('partial.enabled', msg.guild, { cmd: this }) :
                this.localization.tl('partial.disabled', msg.guild, { cmd: this })}`)
            .join('\n');
        return msg.reply(content);
    }
}

module.exports = CommandGroups;
