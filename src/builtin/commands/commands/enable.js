/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../../commands/base');

class CommandEnable extends Command {
    constructor(client) {
        super(client, {
            name: 'enable',
            aliases: ['enable-command', 'cmd-on', 'command-on'],
            group: 'commands',
            module: 'builtin',
            memberName: 'enable',
            examples: ['enable util', 'enable Utility', 'enable prefix'],
            guarded: true,

            args: [
                {
                    key: 'cmdOrGrp',
                    label: 'command/group',
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

    run(msg, args) {
        const { cmdOrGrp } = args;
        const isCmd = Boolean(cmdOrGrp.groupID);

        if (cmdOrGrp.isEnabledIn(msg.guild)) {
            return msg.reply(this.localization.tl(
                `output.${isCmd ? 'command' : 'group'}-already-enabled`, msg.guild, { args, cmd: this }));
        }
        cmdOrGrp.setEnabledIn(msg.guild, true);
        return msg.reply(this.localization.tl(
            `output.${isCmd ? 'command' : 'group'}-enabled`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandEnable;
