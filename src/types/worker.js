/*
 Original author: Archomeda
 */

const ArgumentType = require('./base');
const { formatDisambiguation } = require('../util');

class WorkerArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'worker');
    }

    validate(value, msg) {
        const workers = this.client.registry.findWorkers(value);
        if (workers.length === 1) {
            return true;
        }
        if (workers.length === 0) {
            return false;
        }

        return formatDisambiguation(msg.guild, {
            label: this.client.localization.tl('glossary', 'workers', msg.guild),
            list: workers.map(w => w.id)
        });
    }

    parse(value) {
        return this.client.registry.findWorkers(value)[0];
    }
}

module.exports = WorkerArgumentType;
