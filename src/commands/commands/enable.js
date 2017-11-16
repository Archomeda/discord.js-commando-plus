/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../base');

module.exports = class EnableCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'enable',
            aliases: ['enable-command', 'cmd-on', 'command-on'],
            group: 'commands',
            memberName: 'enable',
            description: client.localeProvider.tl('help', 'commands.enable.description'),
            details: client.localeProvider.tl('help', 'commands.enable.details'),
            examples: ['enable util', 'enable Utility', 'enable prefix'],
            guarded: true,

            args: [
                {
                    key: 'cmdOrGrp',
                    label: 'command/group',
                    prompt: client.localeProvider.tl('help', 'commands.enable.args.command-or-group-prompt'),
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

        if (cmdOrGrp.isEnabledIn(msg.guild)) {
            return msg.reply(l10n.tl(
                'commands',
                `enable.output-${isCmd ? 'command' : 'group'}-already-enabled`,
                { name: cmdOrGrp.name }
            ));
        }
        cmdOrGrp.setEnabledIn(msg.guild, true);
        return msg.reply(l10n.tl(
            'commands',
            `enable.output-${isCmd ? 'command' : 'group'}-enabled`,
            { name: cmdOrGrp.name }
        ));
    }
};
