/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Added support for localization
 */

const ArgumentType = require('./base');

class IntegerArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'integer');
    }

    validate(value, msg, arg) {
        const int = Number.parseInt(value);
        if (Number.isNaN(int)) {
            return false;
        }
        if (arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
            return this.client.localeProvider.tl('common', 'validate-number-above', { min: arg.min });
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
            return this.client.localeProvider.tl('common', 'validate-number-above', { max: arg.max });
        }
        return true;
    }

    parse(value) {
        return Number.parseInt(value);
    }
}

module.exports = IntegerArgumentType;
