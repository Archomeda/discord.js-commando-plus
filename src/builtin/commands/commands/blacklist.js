/*
 Original author: Archomeda
 */

const Command = require('../../../commands/base');
const CommandOrGroupArgumentType = require('../../../types/command-or-group');

class CommandBlacklist extends Command {
    constructor(client) {
        super(client, {
            name: 'blacklist',
            group: 'commands',
            module: 'builtin',
            memberName: 'blacklist',
            aliases: ['bl'],
            examples: ['blacklist help help-channel', 'blacklist all bot-channel'],
            guarded: true,
            guildOnly: true,

            args: [
                {
                    key: 'cmdOrGrp',
                    label: 'command/group',
                    type: 'command-or-group',
                    validate: (val, msg) => {
                        if (val === 'all') {
                            return true;
                        }
                        const type = new CommandOrGroupArgumentType(this.client);
                        return type.validate(val, msg);
                    },
                    parse: val => {
                        if (val === 'all') {
                            return 'all';
                        }
                        const type = new CommandOrGroupArgumentType(this.client);
                        return type.parse(val);
                    }
                },
                {
                    key: 'channels',
                    type: 'channel',
                    infinite: true
                }
            ]
        });
    }

    hasPermission(msg) {
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }

    run(msg, args) {
        let { cmdOrGrp, channels } = args;

        // Check the user's permission before changing anything
        if (!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
            return msg.reply(this.localization.tl('output.admin-only', msg.guild, { args, cmd: this }));
        }

        let commands = [cmdOrGrp];
        if (cmdOrGrp === 'all') {
            commands = this.client.registry.commands.array();
        } else if (cmdOrGrp.commands) {
            commands = cmdOrGrp.commands.array();
        }

        for (const command of commands) {
            command.setBlacklistIn(msg.guild, channels);
        }

        return msg.reply(this.localization.tl('output.blacklist-applied', msg.guild,
            { args, cmd: this, commands: commands.map(c => `\`${c.name}\``) }));
    }
}

module.exports = CommandBlacklist;
