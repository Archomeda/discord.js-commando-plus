/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed disambiguation() to formatDisambiguation()
 - Added support for localization
 */

const ArgumentType = require('./base');
const { formatDisambiguation } = require('../util');

class GroupArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'group');
    }

    validate(value, msg) {
        if (!value) {
            return false;
        }
        const groups = this.client.registry.findGroups(value);
        if (groups.length === 1) {
            return true;
        }
        if (groups.length === 0) {
            return false;
        }

        return formatDisambiguation(msg.guild, {
            label: this.client.localization.tl('glossary', 'groups', msg.guild),
            list: groups.map(c => c.name)
        });
    }

    parse(value) {
        return this.client.registry.findGroups(value)[0];
    }
}

module.exports = GroupArgumentType;
