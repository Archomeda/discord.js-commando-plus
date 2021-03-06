/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added support for workers
 */

const Command = require('../../../commands/base');
const CommandGroup = require('../../../commands/group');
const Worker = require('../../../workers/base');

class CommandDisable extends Command {
    constructor(client) {
        super(client, {
            name: 'disable',
            aliases: ['off'],
            group: 'admin',
            module: 'builtin',
            memberName: 'disable',
            examples: ['disable util', 'disable Utility', 'disable prefix'],
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

        let type;
        if (cmdOrGrpOrWkr instanceof Command) {
            type = 'command';
        } else if (cmdOrGrpOrWkr instanceof CommandGroup) {
            type = 'group';
        } else if (cmdOrGrpOrWkr instanceof Worker) {
            type = 'worker';
        } else {
            return undefined;
        }

        if (!cmdOrGrpOrWkr.isEnabledIn(msg.guild)) {
            return msg.reply(this.localization.tl(`output.${type}-already-disabled`, msg.guild, { args, cmd: this }));
        }
        if (cmdOrGrpOrWkr.guarded) {
            return msg.reply(this.localization.tl(`output.${type}-guarded`, msg.guild, { args, cmd: this }));
        }
        await cmdOrGrpOrWkr.setEnabledIn(msg.guild, false);
        return msg.reply(this.localization.tl(`output.${type}-disabled`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandDisable;
