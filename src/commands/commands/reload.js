/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../base');

module.exports = class ReloadCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reload',
            aliases: ['reload-command'],
            group: 'commands',
            memberName: 'reload',
            description: client.localeProvider.tl('help', 'commands.reload.description'),
            details: client.localeProvider.tl('help', 'commands.reload.details'),
            examples: ['reload some-command'],
            ownerOnly: true,
            guarded: true,

            args: [
                {
                    key: 'cmdOrGrp',
                    label: 'command/group',
                    prompt: client.localeProvider.tl('help', 'commands.reload.args.command-or-group-prompt'),
                    type: 'command-or-group'
                }
            ]
        });
    }

    async run(msg, args) {
        await this.client.localeProvider.preloadNamespace('commands');
        const l10n = this.client.localeProvider;

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
                return msg.reply(l10n.tl(
                    'commands',
                    `reload.output-${isCmd ? 'command' : 'group'}-shards-failed`,
                    { name: cmdOrGrp.name }
                ));
            }
        }

        return msg.reply(l10n.tl('commands', `reload.output-${isCmd ? 'command' : 'group'}`, { name: cmdOrGrp.name }));
    }
};
