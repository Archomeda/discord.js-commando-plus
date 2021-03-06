/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added support for workers
 */

const Command = require('../../../commands/base');
const Worker = require('../../../workers/base');

class CommandUnload extends Command {
    constructor(client) {
        super(client, {
            name: 'unload',
            group: 'admin',
            module: 'builtin',
            memberName: 'unload',
            examples: ['unload some-command', 'unload some-worker'],
            ownerOnly: true,
            guarded: true,

            args: [
                {
                    key: 'cmdOrWkr',
                    label: 'command/worker',
                    type: 'command-or-worker'
                }
            ]
        });
    }

    async run(msg, args) {
        const { cmdOrWkr } = args;
        await cmdOrWkr.unload();

        let type, registry, name;
        if (cmdOrWkr instanceof Command) {
            type = 'command';
            registry = 'commands';
            name = cmdOrWkr.name;
        } else if (cmdOrWkr instanceof Worker) {
            type = 'worker';
            registry = 'workers';
            name = cmdOrWkr.id;
        } else {
            return undefined;
        }

        if (this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
                if (this.shard.id !== ${this.client.shard.id}) {
                    this.registry.${registry}.get('${name}').unload();
                }
            `);
            } catch (err) {
                this.client.emit('warn', `Error when broadcasting ${type} unload to other shards`);
                this.client.emit('error', err);
                return msg.reply(this.localization.tl(`output.${type}-shards-failed`, msg.guild, { args, cmd: this }));
            }
        }

        return msg.reply(this.localization.tl(`output.${type}`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandUnload;
