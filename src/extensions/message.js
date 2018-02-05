/*
 Original author: Archomeda
 */

const { formatFirstLetter } = require('../util');

/**
 * Contains additional methods and properties that are added to the discord.js {@link Message} class.
 */
class MessageExtension {
    /**
     * Overrides {@link Message#edit} to intercept the message content to format with {@link formatFirstLetter}.
     * @param {StringResolvable} [content] The new content for the message
     * @param {MessageEditOptions|RichEmbed} [options={}] The options to provide
     * @return {Promise<Message>} The message.
     */
    edit(content, options) {
        content = this.client.resolver.resolveString(content);
        // Kinda hacky to check it this way
        content = formatFirstLetter(content,
            ((options && options.reply) || !content.startsWith('[')) && this.channel.type !== 'dm');
        return this._edit(content, options);
    }

    /**
     * Applies the interface to a class prototype.
     * @param {Function} target - The constructor function to apply to the prototype of
     * @return {void}
     * @private
     */
    static applyToClass(target) {
        for (const prop of [
            'edit'
        ]) {
            Object.defineProperty(target.prototype, `_${prop}`,
                Object.getOwnPropertyDescriptor(target.prototype, prop));
            Object.defineProperty(target.prototype, prop,
                Object.getOwnPropertyDescriptor(this.prototype, prop));
        }
    }
}

module.exports = MessageExtension;
