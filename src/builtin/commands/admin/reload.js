/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added support for workers
 */

const Command = require('../../../commands/base');
const CommandGroup = require('../../../commands/group');
const Worker = require('../../../workers/base');

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

        let type, registry, name;
        if (cmdOrGrpOrWkr instanceof Command) {
            type = 'command';
            registry = 'commands';
            name = cmdOrGrpOrWkr.name;
        } else if (cmdOrGrpOrWkr instanceof CommandGroup) {
            type = 'group';
            registry = 'groups';
            name = cmdOrGrpOrWkr.id;
        } else if (cmdOrGrpOrWkr instanceof Worker) {
            type = 'worker';
            registry = 'workers';
            name = cmdOrGrpOrWkr.id;
        } else {
            return undefined;
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
