/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added support for workers
 */

const Command = require('../../../commands/base');

class CommandReload extends Command {
    constructor(client) {
        super(client, {
            name: 'reload',
            group: 'admin',
            module: 'builtin',
            memberName: 'reload',
            examples: ['reload some-command', 'reload some-worker'],
            ownerOnly: true,
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

    async run(msg, args) {
        const { cmdOrGrpOrWkr } = args;

        let type = 'group';
        let registry = 'groups';
        let name = cmdOrGrpOrWkr.id;
        if (cmdOrGrpOrWkr.groupID) {
            type = 'command';
            registry = 'commands';
            name = cmdOrGrpOrWkr.name;
        } else if (cmdOrGrpOrWkr.timer) {
            type = 'worker';
            registry = 'workers';
            name = cmdOrGrpOrWkr.id;
        }

        await cmdOrGrpOrWkr.reload();

        if (this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
                    if (this.shard.id !== ${this.client.shard.id}) {
    					this.registry.${registry}.get('${name}').reload();
                    }
				`);
            } catch (err) {
                this.client.emit('warn', `Error when broadcasting ${type} reload to other shards`);
                this.client.emit('error', err);
                return msg.reply(this.localization.tl(`output.${type}-shards-failed`, msg.guild, { args, cmd: this }));
            }
        }

        return msg.reply(this.localization.tl(`output.${type}`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandReload;
