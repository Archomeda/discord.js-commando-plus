/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed disambiguation() to formatDisambiguation()
 - Added support for localization
 */

const ArgumentType = require('./base');
const { formatDisambiguation } = require('../util');

class CommandOrGroupArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'command-or-group');
    }

    validate(value) {
        if (!value) {
            return false;
        }
        const groups = this.client.registry.findGroups(value);
        if (groups.length === 1) {
            return true;
        }
        const commands = this.client.registry.findCommands(value);
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
    }

    parse(value) {
        return this.client.registry.findGroups(value)[0] || this.client.registry.findCommands(value)[0];
    }
}

module.exports = CommandOrGroupArgumentType;
