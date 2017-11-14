/*
 Original author: Archomeda
 */

const { formatFirstLetter } = require('../util');

/**
 * Contains additional methods and properties that are added to the discord.js classes that implement
 * {@link TextBasedChannel}.
 */
class TextBasedChannelExtension {
    /**
     * Overrides {@link TextBasedChannel#send} to intercept the message content to format with
     * {@link formatFirstLetter}.
     * @param {StringResolvable} [content] Text for the message
     * @param {MessageOptions|MessageEmbed|MessageAttachment|MessageAttachment[]} [options={}] Options for the message
     * @return {Promise<Message|Message[]>} The message.
     */
    send(content, options) {
        content = this.client.resolver.resolveString(content);
        content = formatFirstLetter(content, options && options.reply && this.type !== 'dm');
        return this._send(content, options);
    }

    /**
     * Applies the interface to a class prototype.
     * @param {Function} target - The constructor function to apply to the prototype of
     * @return {void}
     * @private
     */
    static applyToClass(target) {
        for (const prop of [
            'send'
        ]) {
            Object.defineProperty(target.prototype, `_${prop}`,
                Object.getOwnPropertyDescriptor(target.prototype, prop));
            Object.defineProperty(target.prototype, prop,
                Object.getOwnPropertyDescriptor(this.prototype, prop));
        }
    }
}

module.exports = TextBasedChannelExtension;
