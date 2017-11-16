/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../base');

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            group: 'util',
            memberName: 'prefix',
            description: client.localeProvider.tl('help', 'utils.prefix.description'),
            format: '[prefix/"default"/"none"]',
            details: client.localeProvider.tl('help', 'utils.prefix.details'),
            examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

            args: [
                {
                    key: 'prefix',
                    prompt: client.localeProvider.tl('help', 'utils.prefix.args.prefix-prompt'),
                    type: 'string',
                    max: 15,
                    default: ''
                }
            ]
        });
    }

    async run(msg, args) {
        await this.client.localeProvider.preloadNamespace('utils');
        const l10n = this.client.localeProvider;

        let { prefix } = args;

        // Just output the prefix
        if (!prefix) {
            prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
            return msg.reply(prefix ?
                l10n.tl('utils', 'prefix.output-prefix', { prefix, anyUsage: msg.anyUsage('command') }) :
                l10n.tl('utils', 'prefix.output-no-prefix', { anyUsage: msg.anyUsage('command') })
            );
        }

        // Check the user's permission before changing anything
        if (msg.guild) {
            if (!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
                return msg.reply(l10n.tl('utils', 'prefix.output-admin-only'));
            }
        } else if (!this.client.isOwner(msg.author)) {
            return msg.reply(l10n.tl('utils', 'prefix.output-owner-only'));
        }

        // Save the prefix
        const lowercase = prefix.toLowerCase();
        prefix = lowercase === 'none' ? '' : prefix;
        if (lowercase === 'default') {
            if (msg.guild) {
                msg.guild.commandPrefix = null;
            } else {
                this.client.commandPrefix = null;
            }
            const current = this.client.commandPrefix ?
                `\`${this.client.commandPrefix}\`` : l10n.tl('utils', 'prefix.no-prefix');
            return msg.reply(l10n.tl(
                'utils',
                'prefix.output-reset-default',
                { default: current, anyUsage: msg.anyUsage('command') }
            ));
        }
        if (msg.guild) {
            msg.guild.commandPrefix = prefix;
        } else {
            this.client.commandPrefix = prefix;
        }

        return msg.reply(prefix ?
            l10n.tl('utils', 'prefix.output-set-prefix', { prefix, anyUsage: msg.anyUsage('command') }) :
            l10n.tl('utils', 'prefix.output-removed-prefix', { anyUsage: msg.anyUsage('command') })
        );
    }
};
