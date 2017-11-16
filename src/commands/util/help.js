/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { formatDisambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'util',
            memberName: 'help',
            aliases: ['commands'],
            description: client.localeProvider.tl('help', 'utils.help.description'),
            details: client.localeProvider.tl('help', 'utils.help.details'),
            examples: ['help', 'help prefix'],
            guarded: true,

            args: [
                {
                    key: 'command',
                    prompt: client.localeProvider.tl('help', 'utils.help.args.command-prompt'),
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, args) { // eslint-disable-line complexity
        await this.client.localeProvider.preloadNamespace('utils');
        const l10n = this.client.localeProvider;

        const { command } = args;

        const groups = this.client.registry.groups;
        const commands = this.client.registry.findCommands(command, false, msg);
        const showAll = command && command.toLowerCase() === 'all';

        if (command && !showAll) {
            if (commands.length === 1) {
                /* eslint-disable max-len, indent */
                let help = stripIndents`
                    ${oneLine`
                        ${l10n.tl('utils', 'command-header',
                            { name: commands[0].name, description: commands[0].description })}
                        ${commands[0].guildOnly ? ` ${l10n.tl('utils', 'help.guild-only')}` : ''}
                        ${commands[0].nsfw ? ` ${l10n.tl('utils', 'help.nsfw')}` : ''}
                    `}
                    
                    ${l10n.tl('utils', 'command-format',
                        { usage: msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`) }
                    )}
                `;
                /* eslint-enable max-len, indent */
                if (commands[0].aliases.length > 0) {
                    help += `\n${l10n.tl('utils', 'help.command-aliases',
                        { aliases: commands[0].aliases.join(', ') })}`;
                }
                help += `\n${l10n.tl('utils', 'help.command-group', {
                    group: commands[0].group.name,
                    id: `${commands[0].groupID}:${commands[0].memberName}`
                })}`;
                if (commands[0].details) {
                    help += `\n${l10n.tl('utils', 'help.command-details', { details: commands[0].details })}`;
                }
                if (commands[0].examples) {
                    help += `\n${l10n.tl('utils', 'help.command-examples',
                        { examples: commands[0].examples.join('\n') })}`;
                }

                const messages = [];
                try {
                    messages.push(await msg.direct(help));
                    if (msg.channel.type !== 'dm') {
                        messages.push(await msg.reply(l10n.tl('utils', 'help.output-sent-dm')));
                    }
                } catch (err) {
                    messages.push(await msg.reply(l10n.tl('utils', 'help.output-sending-dm-failed')));
                }
                return messages;
            } else if (commands.length > 1) {
                return msg.reply(formatDisambiguation(this.client, {
                    label: this.client.localeProvider.tl('common', 'commands'),
                    list: commands
                }));
            } else {
                return msg.reply(l10n.tl('utils', 'help.output-no-command', {
                    usage: msg.usage(
                        null,
                        msg.channel.type === 'dm' ? null : undefined,
                        msg.channel.type === 'dm' ? null : undefined
                    )
                }));
            }
        } else {
            const messages = [];
            try {
                /* eslint-disable camelcase */
                const heading = l10n.tl('utils', `help.output-heading-${msg.channel.type}`, {
                    guild: msg.guild,
                    dm_usage: Command.usage('command', null, null),
                    guild_usage: Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user),
                    example: Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user),
                    detailed_help: this.usage('<command>', null, null), // eslint-disable-line camelcase
                    all_help: this.usage('all', null, null) // eslint-disable-line camelcase
                });
                /* eslint-enable camelcase */
                const description = l10n.tl('utils', `help.output-description-${showAll ? 'all' : msg.channel.type}`,
                    { guild: msg.guild });

                /* eslint-disable indent, max-len */
                messages.push(await msg.direct(stripIndents`
                    ${heading}
                    
                    ${description}
                    
					${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
                    .map(grp => stripIndents`
							__${grp.name}__
							${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
                        .map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? l10n.tl('utils', 'nsfw') : ''}`).join('\n')
                        }
						`).join('\n\n')
                    }
				`, { split: true }));
                /* eslint-enable indent, max-len */
                if (msg.channel.type !== 'dm') {
                    messages.push(await msg.reply(l10n.tl('utils', 'help.output-sent-dm')));
                }
            } catch (err) {
                messages.push(await msg.reply(l10n.tl('utils', 'help.output-sending-dm-failed')));
            }
            return messages;
        }
    }
};
