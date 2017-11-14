const FriendlyError = require('./friendly');

/**
 * Has a descriptive message for a command not having proper format.
 * @extends {FriendlyError}
 */
class CommandFormatError extends FriendlyError {
    /**
     * @param {CommandMessage} msg - The command message the error is for
     */
    constructor(msg) {
        super(msg.client.localeProvider.tl('errors', 'invalid-command-format', {
            usage: msg.anyUsage(
                `help ${msg.command.name}`,
                msg.guild ? undefined : null,
                msg.guild ? undefined : null
            )
        }));
        this.name = 'CommandFormatError';
    }
}

module.exports = CommandFormatError;
