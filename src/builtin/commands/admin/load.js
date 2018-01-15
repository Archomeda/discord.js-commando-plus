/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 - Added support for workers
 */

const fs = require('fs');
const Command = require('../../../commands/base');

class CommandLoad extends Command {
    constructor(client) {
        super(client, {
            name: 'load',
            group: 'admin',
            module: 'builtin',
            memberName: 'load',
            examples: ['load some-command', 'load some-worker'],
            ownerOnly: true,
            guarded: true,

            args: [
                {
                    key: 'cmdOrWkr',
                    label: 'command-or-worker',
                    validate: (val, msg) => new Promise(resolve => {
                        if (!val) {
                            return resolve(false);
                        }
                        const split = val.split(':');
                        if (split.length < 2 || split.length > 3) {
                            return resolve(false);
                        }
                        if (this.client.registry.findCommands(val).length > 0) {
                            const args = { command: this.client.registry.resolveCommand(val) };
                            return resolve(this.localization.tl(
                                'output.command-already-registered', msg.guild, { args, cmd: this }));
                        }
                        if (this.client.registry.findWorkers(val).length > 0) {
                            const args = { command: this.client.registry.resolveWorker(val) };
                            return resolve(this.localization.tl(
                                'output.worker-already-registered', msg.guild, { args, cmd: this }));
                        }
                        let path;
                        if (split.length === 2) {
                            path = this.client.registry.resolveWorkerPath(split[0], split[1]);
                        } else if (split.length === 3) {
                            path = this.client.registry.resolveCommandPath(split[0], split[1], split[2]);
                        }
                        fs.access(path, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
                        return null;
                    }),
                    parse: val => {
                        const split = val.split(':');
                        let path;
                        if (split.length === 2) {
                            path = this.client.registry.resolveWorkerPath(split[0], split[1]);
                        } else if (split.length === 3) {
                            path = this.client.registry.resolveCommandPath(split[0], split[1], split[2]);
                        }
                        delete require.cache[path];
                        return require(path);
                    }
                }
            ]
        });
    }

    async run(msg, args) {
        let { cmdOrWkr } = args;
        if (cmdOrWkr.prototype.groupID) {
            this.client.registry.registerCommand(cmdOrWkr);
            cmdOrWkr = this.client.registry.commands.last();
        } else {
            this.client.registry.registerWorker(cmdOrWkr);
            cmdOrWkr = this.client.registry.workers.last();
        }
        const type = cmdOrWkr.groupID ? 'command' : 'worker';

        if (this.client.shard) {
            try {
                /* eslint-disable indent */
                await this.client.shard.broadcastEval(`
                    if (this.shard.id !== ${this.client.shard.id}) {
                        ${type === 'command' ?
                            `const path = this.registry.resolveCommandPath(
                                '${cmdOrWkr.moduleID}', '${cmdOrWkr.groupID}', '${cmdOrWkr.name}');` :
                            `const path = this.registry.resolveWorkerPath(
                                '${cmdOrWkr.moduleID}', '${cmdOrWkr.id}');`}
                        delete require.cache[path];
                        ${type === 'command' ? 'this.registry.registerCommand(require(path));' :
                            'this.registry.registerWorker(require(path));'}
                    }
				`);
                /* eslint-enable indent */
            } catch (err) {
                this.client.emit('warn', `Error when broadcasting ${type} load to other shards`);
                this.client.emit('error', err);
                return msg.reply(this.localization.tl(`output.${type}-shards-failed`, msg.guild, { args, cmd: this }));
            }
        }

        return msg.reply(this.localization.tl(`output.${type}`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandLoad;
