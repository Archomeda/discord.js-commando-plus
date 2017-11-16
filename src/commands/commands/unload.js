/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../base');

module.exports = class UnloadCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unload',
            aliases: ['unload-command'],
            group: 'commands',
            memberName: 'unload',
            description: client.localeProvider.tl('help', 'commands.unload.description'),
            details: client.localeProvider.tl('help', 'commands.unload.details'),
            examples: ['unload some-command'],
            ownerOnly: true,
            guarded: true,

            args: [
                {
                    key: 'command',
                    prompt: client.localeProvider.tl('help', 'commands.unload.args.command-prompt'),
                    type: 'command'
                }
            ]
        });
    }

    async run(msg, args) {
        await this.client.localeProvider.preloadNamespace('commands');
        const l10n = this.client.localeProvider;

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
                return msg.reply(l10n.tl('commands', 'unload.output-command-shards-failed', { name: command.name }));
            }
        }

        return msg.reply(l10n.tl('commands', 'unload.output-command', { name: command.name }));
    }
};
