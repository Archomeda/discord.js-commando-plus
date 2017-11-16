/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../base');

module.exports = class ListGroupsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'groups',
            aliases: ['list-groups', 'show-groups'],
            group: 'commands',
            memberName: 'groups',
            description: client.localeProvider.tl('help', 'commands.list-groups.description'),
            details: client.localeProvider.tl('help', 'commands.list-groups.details'),
            guarded: true
        });
    }

    hasPermission(msg) {
        if (!msg.guild) {
            return this.client.isOwner(msg.author);
        }
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }

    async run(msg) {
        await this.client.localeProvider.preloadNamespace('commands');
        const l10n = this.client.localeProvider;

        let content = `\n__**${l10n.tl('commands', 'list-groups.output-header')}**__\n`;
        content += this.client.registry.groups.map(grp =>
            `**${grp.name}:** ${grp.isEnabledIn(msg.guild) ?
                l10n.tl('commands', 'list-groups.enabled') :
                l10n.tl('commands', 'list-groups.disabled')}`)
            .join('\n');
        return msg.reply(content);
    }
};
