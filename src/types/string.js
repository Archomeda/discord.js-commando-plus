/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const ArgumentType = require('./base');

class StringArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'string');
    }

    validate(value, msg, arg) {
        if (!value) {
            return false;
        }
        if (arg.min !== null && typeof arg.min !== 'undefined' && value.length < arg.min) {
            return this.client.localization.tl('common', 'validate-string-count-above', msg.guild, {
                argument: arg.label,
                min: arg.min
            });
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && value.length > arg.max) {
            return this.client.localization.tl('common', 'validate-string-count-below', msg.guild, {
                argument: arg.label,
                max: arg.max
            });
        }
        return true;
    }

    parse(value) {
        return value;
    }
}

module.exports = StringArgumentType;
