/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed to comply with the Command class changes
 */

const stripIndents = require('common-tags').stripIndents;
const commando = require('../../../src');

class CommandUserInfo extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'user-info',
            aliases: ['user', '🗒'],
            group: 'utils',
            module: 'test',
            memberName: 'user-info',
            examples: ['user-info @Crawl#3208', 'user-info Crawl'],
            guildOnly: true,

            args: [
                {
                    key: 'member',
                    label: 'user',
                    type: 'member'
                }
            ]
        });
    }

    async run(msg, args) {
        const member = args.member;
        const user = member.user;

        // Ideally we want to have this localized too, but for the sake of being lazy, we don't do that right now
        return msg.reply(stripIndents`
			Info on **${user.username}#${user.discriminator}** (ID: ${user.id})

			**❯ Member Details**
			${member.nickname !== null ? ` • Nickname: ${member.nickname}` : ' • No nickname'}
			 • Roles: ${member.roles.map(roles => `\`${roles.name}\``).join(', ')}
			 • Joined at: ${member.joinedAt}

			**❯ User Details**
			 • Created at: ${user.createdAt}${user.bot ? '\n • Is a bot account' : ''}
			 • Status: ${user.presence.status}
			 • Game: ${user.presence.game ? user.presence.game.name : 'None'}
		`);
    }
}

module.exports = CommandUserInfo;
