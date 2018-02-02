/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added support for workers
 */

const Command = require('../../../commands/base');

class CommandEnable extends Command {
    constructor(client) {
        super(client, {
            name: 'enable',
            aliases: ['on'],
            group: 'admin',
            module: 'builtin',
            memberName: 'enable',
            examples: ['enable util', 'enable Utility', 'enable prefix'],
            guarded: true,

            args: [
                {
                    key: 'cmdOrGrpOrWkr',
                    label: 'command/group/worker',
                    type: 'command-or-group-or-worker'
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
        const { cmdOrGrpOrWkr } = args;

        let type = 'group';
        if (cmdOrGrpOrWkr.groupID) {
            type = 'command';
        } else if (cmdOrGrpOrWkr.schedule) {
            type = 'worker';
        }

        if (cmdOrGrpOrWkr.isEnabledIn(msg.guild)) {
            return msg.reply(this.localization.tl(`output.${type}-already-enabled`, msg.guild, { args, cmd: this }));
        }
        await cmdOrGrpOrWkr.setEnabledIn(msg.guild, true);
        return msg.reply(this.localization.tl(`output.${type}-enabled`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandEnable;
