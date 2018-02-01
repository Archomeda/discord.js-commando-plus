/*
 Original author: Archomeda
 */

const Command = require('../../../commands/base');

class CommandActivity extends Command {
    constructor(client) {
        super(client, {
            name: 'activity',
            group: 'admin',
            module: 'builtin',
            memberName: 'activity',
            examples: ['activity playing "I am a bot"', 'activity streaming "game" "stream-url"'],
            ownerOnly: true,
            guarded: true,

            args: [
                {
                    key: 'type',
                    type: 'string',
                    validate: val => ['playing', 'streaming', 'listening', 'watching', 'none'].includes(val),
                    parse: val => val.toUpperCase()
                },
                {
                    key: 'game',
                    type: 'string',
                    default: ''
                },
                {
                    key: 'url',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, args) {
        const { type, game, url } = args;

        if (type === 'NONE') {
            // Workaround until discordjs/discord.js#2270 is released
            await this.client.user.setPresence({ game: null });
        } else {
            const options = { type };
            if (url) {
                options.url = url;
            }
            await this.client.user.setActivity(game, options);
        }

        /**
         * Emitted when the default bot activity is changed.
         * @event CommandoClient#defaultActivityChange
         * @param {string} type - The activity type
         * @param {string} game - The game name
         * @param {string} url - The stream URL
         */
        this.client.emit('defaultActivityChange', type, game, url);
        return msg.reply(this.localization.tl(`output.set-activity`, msg.guild, { args, cmd: this }));
    }
}

module.exports = CommandActivity;
