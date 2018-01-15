/*
 Original author: Archomeda
 */

const ArgumentType = require('./base');
const { formatDisambiguation } = require('../util');

class CommandOrWorkerArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'command-or-worker');
    }

    validate(value, msg) {
        const commands = this.client.registry.findCommands(value);
        if (commands.length === 1) {
            return true;
        }
        const workers = this.client.registry.findWorkers(value);
        if (workers.length === 1) {
            return true;
        }
        if (commands.length === 0 && workers.length === 0) {
            return false;
        }

        const list = [];
        if (commands.length > 0) {
            list.push({
                label: this.client.localization.tl('glossary', 'commands', msg.guild),
                list: commands.map(c => c.name)
            });
        }
        if (workers.length > 0) {
            list.push({
                label: this.client.localization.tl('glossary', 'workers', msg.guild),
                list: workers.map(g => g.name)
            });
        }
        return formatDisambiguation(msg.guild, list);
    }

    parse(value) {
        return this.client.registry.findCommands(value)[0] || this.client.registry.findWorkers(value)[0];
    }
}

module.exports = CommandOrWorkerArgumentType;
