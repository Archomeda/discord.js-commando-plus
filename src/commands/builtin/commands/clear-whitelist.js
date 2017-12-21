/*
 Original author: Archomeda
 */

const Command = require('../../base');
const CommandOrGroupArgumentType = require('../../../types/command-or-group');

class CommandWhitelist extends Command {
    constructor(client) {
        super(client, {
            name: 'clear-whitelist',
            group: 'commands',
            module: 'builtin',
            memberName: 'clear-whitelist',
            aliases: ['cwl'],
            examples: ['clear-whitelist help', 'clear-whitelist all'],
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
                }
            ]
        });
    }

    hasPermission(msg) {
        if (!msg.guild) {
            return this.client.isOwner(msg.author);
        }
        return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }

    run(msg, args) {
        let { cmdOrGrp } = args;

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
            command.clearWhitelistIn(msg.guild);
        }

        return msg.reply(this.localization.tl('output.whitelist-removed', msg.guild,
            { args, cmd: this, commands: commands.map(c => `\`${c.name}\``) }));
    }
}

module.exports = CommandWhitelist;
