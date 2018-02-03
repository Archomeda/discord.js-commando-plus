/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const { stripIndents, oneLine } = require('common-tags');
const Command = require('../../../commands/base');
const { formatDisambiguation } = require('../../../util');

class CommandHelp extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'utils',
            module: 'builtin',
            memberName: 'help',
            aliases: ['commands'],
            examples: ['help', 'help prefix'],
            guarded: true,

            args: [
                {
                    key: 'command',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, args) { // eslint-disable-line complexity
        const { command } = args;

        const groups = this.client.registry.groups;
        const commands = this.client.registry.findCommands(command, false, msg);
        const showAll = command && command.toLowerCase() === 'all';

        if (command && !showAll) {
            if (commands.length === 1) {
                /* eslint-disable max-len, indent */
                let help = stripIndents`
                    ${oneLine`
                        ${this.localization.tl('partial.command-header', msg.guild,
                    { name: commands[0].name, description: commands[0].localization.tl(this.description) })}
                        ${commands[0].guildOnly ? ` ${this.localization.tl('partial.guild-only', msg.guild)}` : ''}
                        ${commands[0].nsfw ? ` ${this.localization.tl('partial.nsfw', msg.guild)}` : ''}
                    `}
                    
                    ${this.localization.tl('partial.command-format', msg.guild,
                    { usage: msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`) }
                )}
                `;
                /* eslint-enable max-len, indent */
                if (commands[0].aliases.length > 0) {
                    help += `\n${this.localization.tl('partial.command-aliases', msg.guild,
                        { aliases: commands[0].aliases.join(', ') })}`;
                }
                help += `\n${this.localization.tl('partial.command-group', msg.guild, {
                    group: commands[0].group.module.localization.tl('groups', commands[0].group.name, msg.guild),
                    id: `${commands[0].groupID}:${commands[0].memberName}`
                })}`;
                help += `\n${this.localization.tl('partial.command-details', msg.guild,
                    { details: commands[0].localization.tl(this.details) })}`;
                if (commands[0].examples) {
                    help += `\n${this.localization.tl('partial.command-examples', msg.guild,
                        { examples: commands[0].examples.join('\n') })}`;
                }

                const messages = [];
                try {
                    messages.push(await msg.direct(help));
                    if (msg.channel.type !== 'dm') {
                        messages.push(await msg.reply(this.localization.tl('output.sent-dm', msg.guild)));
                    }
                } catch (err) {
                    messages.push(await msg.reply(this.localization.tl('output.sending-dm-failed', msg.guild)));
                }
                return messages;
            } else if (commands.length > 15) {
                return msg.reply(this.client.localization.tl('common', 'disambiguation-commands', msg.guild));
            } else if (commands.length > 1) {
                return msg.reply(formatDisambiguation(msg.guild, {
                    label: this.client.localization.tl('glossary', 'commands', msg.guild),
                    list: commands
                }));
            } else {
                return msg.reply(this.localization.tl('output.no-command', msg.guild, {
                    usage: msg.usage(
                        null,
                        msg.channel.type === 'dm' ? null : undefined,
                        msg.channel.type === 'dm' ? null : undefined
                    )
                }));
            }
        } else {
            // Make sure to preload the localizations
            await Promise.all(groups
                .map(g => g.commands)
                .reduce((a, b) => a.concat(b.array()), [])
                .map(c => c.preloadLocalization()));

            const messages = [];
            try {
                /* eslint-disable camelcase */
                const heading = this.localization.tl(`partial.heading-${msg.channel.type}`, msg.guild, {
                    guild: msg.guild,
                    dm_usage: Command.usage('command', null, null),
                    guild_usage: Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user),
                    example: Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user),
                    detailed_help: this.usage('<command>', null, null), // eslint-disable-line camelcase
                    all_help: this.usage('all', null, null) // eslint-disable-line camelcase
                });
                /* eslint-enable camelcase */
                const description = this.localization.tl(`partial.description-${showAll ? 'all' : msg.channel.type}`,
                    msg.guild, { guild: msg.guild });

                /* eslint-disable indent, max-len */
                const messageToSend = stripIndents`
                    ${heading}
                    
                    ${description}
                    
					${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
                    .map(grp => stripIndents`
							__${grp.module.localization.tl('groups', grp.name, msg.guild)}__
							${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
                        .map(cmd => `**${cmd.name}:** ${cmd.localization.tl(this.description, msg.guild)}${cmd.nsfw ? this.localization.tl('partial.nsfw', msg.guild) : ''}`).join('\n')
                        }
						`).join('\n\n')
                    }
				`;
                /* eslint-enable indent, max-len */
                if (msg.channel.type === 'dm') {
                    messages.push(await msg.reply(messageToSend, { split: true }));
                } else {
                    messages.push(await msg.direct(messageToSend, { split: true }));
                    messages.push(await msg.reply(this.localization.tl('output.sent-dm', msg.guild)));
                }
            } catch (err) {
                messages.push(await msg.reply(this.localization.tl('output.sending-dm-failed', msg.guild)));
            }
            return messages;
        }
    }
}

module.exports = CommandHelp;
