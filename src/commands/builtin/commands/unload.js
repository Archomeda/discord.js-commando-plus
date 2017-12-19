/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../base');

class CommandUnload extends Command {
    constructor(client) {
        super(client, {
            name: 'unload',
            aliases: ['unload-command'],
            group: 'commands',
            module: 'builtin',
            memberName: 'unload',
            examples: ['unload some-command'],
            ownerOnly: true,
            guarded: true,

            args: [
                {
                    key: 'command',
                    type: 'command'
                }
            ]
        });
    }

    async run(msg, args) {
        const { command } = args;
        command.unload();

        if (this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
                    if (this.shard.id !== ${this.client.shard.id}) {
                        this.registry.commands.get('${command.name}').unload();
                    }
                `);
            } catch (err) {
                this.client.emit('warn', 'Error when broadcasting command unload to other shards');
                this.client.emit('error', err);
                return msg.reply(this.localization.tl('output.command-shards-failed', msg.guild, { args, cmd: this }));
            }
        }

        return msg.reply(this.localization.tl('output.command', msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandUnload;
