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
        super(msg.client.localization.tl('errors', 'invalid-command-format', msg.guild, {
            usage: msg.usage(
                msg.command.format,
                msg.guild ? undefined : null,
                msg.guild ? undefined : null
            ),
            help_usage: msg.anyUsage( // eslint-disable-line camelcase
                `help ${msg.command.name}`,
                msg.guild ? undefined : null,
                msg.guild ? undefined : null
            )
        }));
        this.name = 'CommandFormatError';
    }
}

module.exports = CommandFormatError;
