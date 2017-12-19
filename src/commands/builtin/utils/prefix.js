/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const Command = require('../../base');

class CommandPrefix extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            group: 'utils',
            module: 'builtin',
            memberName: 'prefix',
            format: '[prefix/"default"/"none"]',
            examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

            args: [
                {
                    key: 'prefix',
                    type: 'string',
                    max: 15,
                    default: ''
                }
            ]
        });
    }

    run(msg, args) {
        let { prefix } = args;

        // Just output the prefix
        if (!prefix) {
            prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
            return msg.reply(prefix ?
                this.localization.tl(
                    'output.prefix', msg.guild, { args, cmd: this, anyUsage: msg.anyUsage('command') }) :
                this.localization.tl(
                    'output.no-prefix', msg.guild, { args, cmd: this, anyUsage: msg.anyUsage('command') })
            );
        }

        // Check the user's permission before changing anything
        if (msg.guild) {
            if (!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
                return msg.reply(this.localization.tl('output.admin-only', msg.guild, { args, cmd: this }));
            }
        } else if (!this.client.isOwner(msg.author)) {
            return msg.reply(this.localization.tl('output.owner-only', msg.guild, { args, cmd: this }));
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
                `\`${this.client.commandPrefix}\`` :
                this.localization.tl('partial.no-prefix', msg.guild, { cmd: this });
            return msg.reply(this.localization.tl(
                'output.reset-default',
                msg.guild,
                { args, cmd: this, default: current, anyUsage: msg.anyUsage('command') }
            ));
        }
        if (msg.guild) {
            msg.guild.commandPrefix = prefix;
        } else {
            this.client.commandPrefix = prefix;
        }

        return msg.reply(prefix ?
            this.localization.tl(
                'output.set-prefix', msg.guild, { args, cmd: this, prefix, anyUsage: msg.anyUsage('command') }) :
            this.localization.tl(
                'output.removed-prefix', msg.guild, { args, cmd: this, anyUsage: msg.anyUsage('command') })
        );
    }
}

module.exports = CommandPrefix;
