/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../../commands/base');

class CommandDisable extends Command {
    constructor(client) {
        super(client, {
            name: 'disable',
            aliases: ['disable-command', 'cmd-off', 'command-off'],
            group: 'commands',
            module: 'builtin',
            memberName: 'disable',
            examples: ['disable util', 'disable Utility', 'disable prefix'],
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

        if (!cmdOrGrp.isEnabledIn(msg.guild)) {
            return msg.reply(this.localization.tl(
                `output.${isCmd ? 'command' : 'group'}-already-disabled`, msg.guild, { args, cmd: this }));
        }
        if (cmdOrGrp.guarded) {
            return msg.reply(this.localization.tl(
                `output.${isCmd ? 'command' : 'group'}-guarded`, msg.guild, { args, cmd: this }));
        }
        cmdOrGrp.setEnabledIn(msg.guild, false);
        return msg.reply(this.localization.tl(
            `output.${isCmd ? 'command' : 'group'}-disabled`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandDisable;
