/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed disambiguation() to formatDisambiguation()
 - Added support for localization
 */

const ArgumentType = require('./base');
const { formatDisambiguation } = require('../util');

class CommandArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'command');
    }

    validate(value, msg) {
        if (!value) {
            return false;
        }
        const commands = this.client.registry.findCommands(value);
        if (commands.length === 1) {
            return true;
        }
        if (commands.length === 0) {
            return false;
        }

        return formatDisambiguation(this.client, {
            label: this.client.localization.tl('common', 'commands', msg.guild),
            list: commands.map(c => c.name)
        });
    }

    parse(value) {
        return this.client.registry.findCommands(value)[0];
    }
}

module.exports = CommandArgumentType;
