/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed disambiguation() to formatDisambiguation()
 - Added support for localization
 */

const { oneLine } = require('common-tags');
const Command = require('../base');
const formatDisambiguation = require('../../util').formatDisambiguation;

module.exports = class ReloadCommandCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reload',
            aliases: ['reload-command'],
            group: 'commands',
            memberName: 'reload',
            description: 'Reloads a command or command group.',
            details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Providing a command group will reload all of the commands in that group.
				Only the bot owner(s) may use this command.
			`,
            examples: ['reload some-command'],
            guarded: true,

            args: [
                {
                    key: 'cmdOrGrp',
                    label: 'command/group',
                    prompt: 'Which command or group would you like to reload?',
                    validate: val => {
                        if (!val) {
                            return false;
                        }
                        const groups = this.client.registry.findGroups(val);
                        if (groups.length === 1) {
                            return true;
                        }
                        const commands = this.client.registry.findCommands(val);
                        if (commands.length === 1) {
                            return true;
                        }
                        if (commands.length === 0 && groups.length === 0) {
                            return false;
                        }

                        const list = [];
                        if (commands.length > 0) {
                            list.push({
                                label: this.client.localeProvider.tl('common', 'commands'),
                                list: commands.map(c => c.name)
                            });
                        }
                        if (groups.length > 0) {
                            list.push({
                                label: this.client.localeProvider.tl('common', 'groups'),
                                list: groups.map(g => g.name)
                            });
                        }
                        return formatDisambiguation(this.client, list);
                    },
                    parse: val => this.client.registry.findGroups(val)[0] || this.client.registry.findCommands(val)[0]
                }
            ]
        });
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    async run(msg, args) {
        args.cmdOrGrp.reload();
        if (args.cmdOrGrp.group) {
            await msg.reply(`Reloaded \`${args.cmdOrGrp.name}\` command.`);
        } else {
            await msg.reply(`Reloaded all of the commands in the \`${args.cmdOrGrp.name}\` group.`);
        }
        return null;
    }
};
