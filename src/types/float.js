/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const ArgumentType = require('./base');

class FloatArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'float');
    }

    validate(value, msg, arg) {
        const float = Number.parseFloat(value);
        if (Number.isNaN(float)) {
            return false;
        }
        if (arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
            return this.client.localization.tl('common', 'validate-number-above', msg.guild, { min: arg.min });
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
            return this.client.localization.tl('common', 'validate-number-above', msg.guild, { max: arg.max });
        }
        return true;
    }

    parse(value) {
        return Number.parseFloat(value);
    }
}

module.exports = FloatArgumentType;
