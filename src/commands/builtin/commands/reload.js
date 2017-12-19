/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../base');

class CommandReload extends Command {
    constructor(client) {
        super(client, {
            name: 'reload',
            aliases: ['reload-command'],
            group: 'commands',
            module: 'builtin',
            memberName: 'reload',
            examples: ['reload some-command'],
            ownerOnly: true,
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

    async run(msg, args) {
        const { cmdOrGrp } = args;
        const isCmd = Boolean(cmdOrGrp.groupID);
        cmdOrGrp.reload();

        if (this.client.shard) {
            try {
                await this.client.shard.broadcastEval(`
                    if (this.shard.id !== ${this.client.shard.id}) {
    					this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : cmdOrGrp.id}')
    					    .reload();
                    }
				`);
            } catch (err) {
                this.client.emit('warn', 'Error when broadcasting command reload to other shards');
                this.client.emit('error', err);
                return msg.reply(this.localization.tl(
                    `output.${isCmd ? 'command' : 'group'}-shards-failed`, msg.guild, { args, cmd: this }));
            }
        }

        return msg.reply(this.localization.tl(`output.${isCmd ? 'command' : 'group'}`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandReload;
