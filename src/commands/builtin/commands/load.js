/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const fs = require('fs');
const Command = require('../../base');

class CommandLoad extends Command {
    constructor(client) {
        super(client, {
            name: 'load',
            aliases: ['load-command'],
            group: 'commands',
            module: 'builtin',
            memberName: 'load',
            examples: ['load some-command'],
            ownerOnly: true,
            guarded: true,

            args: [
                {
                    key: 'command',
                    validate: (val, msg) => new Promise(resolve => {
                        if (!val) {
                            return resolve(false);
                        }
                        const split = val.split(':');
                        if (split.length !== 3) {
                            return resolve(false);
                        }
                        if (this.client.registry.findCommands(val).length > 0) {
                            const args = { command: this.client.registry.resolveCommand(val) };
                            return resolve(this.localization.tl(
                                'output.already-registered', msg.guild, { args, cmd: this }));
                        }
                        const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1], split[2]);
                        fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
                        return null;
                    }),
                    parse: val => {
                        const split = val.split(':');
                        const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1], split[2]);
                        delete require.cache[cmdPath];
                        return require(cmdPath);
                    }
                }
            ]
        });
    }

    async run(msg, args) {
        this.client.registry.registerCommand(args.command);
        args.command = this.client.registry.commands.last();

        if (this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
                    if (this.shard.id !== ${this.client.shard.id}) {
                        const cmdPath = this.registry.resolveCommandPath(
                            '${args.command.moduleID}', '${args.command.groupID}', '${args.command.name}');
                        delete require.cache[cmdPath];
                        this.registry.registerCommand(require(cmdPath));
                    }
				`);
            } catch (err) {
                this.client.emit('warn', 'Error when broadcasting command load to other shards');
                this.client.emit('error', err);
                return msg.reply(this.localization.tl('output.command-shards-failed', msg.guild, { args, cmd: this }));
            }
        }

        return msg.reply(this.localization.tl('output.command', msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandLoad;
