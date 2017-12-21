/*
 Original author: Archomeda
 */

const Command = require('../../base');

class CommandWhitelist extends Command {
    constructor(client) {
        super(client, {
            name: 'show-whitelist',
            group: 'commands',
            module: 'builtin',
            memberName: 'show-whitelist',
            aliases: ['swl', 'show-wl'],
            examples: ['show-whitelist help'],
            guarded: true,
            guildOnly: true,

            args: [
                {
                    key: 'command',
                    type: 'command'
                }
            ]
        });
    }

    run(msg, args) {
        let { command } = args;

        const whitelist = msg.guild.settings.get(`whitelisted-channels.${command.name}`, [])
            .map(c => msg.guild.channels.get(c))
            .filter(c => c);
        const blacklist = msg.guild.settings.get(`blacklisted-channels.${command.name}`, [])
            .map(c => msg.guild.channels.get(c))
            .filter(c => c);

        if (whitelist.length === 0 && blacklist.length === 0) {
            return msg.reply(this.localization.tl('output.command-allowed', msg.guild, { args, cmd: this }));
        } else if (whitelist.length > 0) {
            return msg.reply(this.localization.tl('output.command-whitelist', msg.guild,
                { args, cmd: this, channels: whitelist }));
        } else if (blacklist.length > 0) {
            return msg.reply(this.localization.tl('output.command-blacklist', msg.guild,
                { args, cmd: this, channels: blacklist }));
        }
    }
}

module.exports = CommandWhitelist;
