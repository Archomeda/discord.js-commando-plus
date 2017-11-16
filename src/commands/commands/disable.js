/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../base');

module.exports = class DisableCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'disable',
            aliases: ['disable-command', 'cmd-off', 'command-off'],
            group: 'commands',
            memberName: 'disable',
            description: client.localeProvider.tl('help', 'commands.disable.description'),
            details: client.localeProvider.tl('help', 'commands.disable.details'),
            examples: ['disable util', 'disable Utility', 'disable prefix'],
            guarded: true,

            args: [
                {
                    key: 'cmdOrGrp',
                    label: 'command/group',
                    prompt: client.localeProvider.tl('help', 'commands.disable.args.command-or-group-prompt'),
                    type: 'command-or-group'
                }
            ]
        });
    }

    hasPermission(msg) {
        if (!msg.guild) {
            return this.client.isOwner(msg.author);
        }
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }

    async run(msg, args) {
        await this.client.localeProvider.preloadNamespace('commands');
        const l10n = this.client.localeProvider;

        const { cmdOrGrp } = args;
        const isCmd = Boolean(cmdOrGrp.groupID);

        if (!cmdOrGrp.isEnabledIn(msg.guild)) {
            return msg.reply(l10n.tl(
                'commands',
                `disable.output-${isCmd ? 'command' : 'group'}-already-disabled`,
                { name: cmdOrGrp.name }
            ));
        }
        if (cmdOrGrp.guarded) {
            return msg.reply(l10n.tl(
                'commands',
                `disable.output-${isCmd ? 'command' : 'group'}-guarded`,
                { name: cmdOrGrp.name }
            ));
        }
        cmdOrGrp.setEnabledIn(msg.guild, false);
        return msg.reply(l10n.tl(
            'commands',
            `disable.output-${isCmd ? 'command' : 'group'}-disabled`,
            { name: cmdOrGrp.name }
        ));
    }
};
