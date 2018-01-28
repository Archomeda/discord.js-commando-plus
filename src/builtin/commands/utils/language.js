/*
 Original author: Archomeda
 */

const fs = require('fs');
const path = require('path');
const Command = require('../../../commands/base');

class CommandLanguage extends Command {
    constructor(client) {
        super(client, {
            name: 'language',
            group: 'utils',
            module: 'builtin',
            memberName: 'language',
            aliases: ['lang'],
            examples: ['lang', 'lang default', 'lang en-US'],
            guarded: true,

            args: [
                {
                    key: 'language',
                    type: 'string',
                    default: '',
                    validate: val => {
                        if (val === '' || val === 'default') {
                            return true;
                        }
                        return Boolean(client.registry.modules.find(
                            m => fs.existsSync(path.join(m.localizationDirectory, val))));
                    }
                }
            ]
        });
    }

    run(msg, args) {
        let { language } = args;

        // Just output the language
        if (!language) {
            language = msg.guild ? msg.guild.language : this.client.language;
            return msg.reply(this.localization.tl('output.language', msg.guild, { args, language, cmd: this }));
        }

        // Check the user's permission before changing anything
        if (msg.guild) {
            if (!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
                return msg.reply(this.localization.tl('output.admin-only', msg.guild, { args, cmd: this }));
            }
        } else if (!this.client.isOwner(msg.author)) {
            return msg.reply(this.localization.tl('output.owner-only', msg.guild, { args, cmd: this }));
        }

        // Save the language
        if (language.toLowerCase() === 'default') {
            if (msg.guild) {
                msg.guild.language = null;
            } else {
                this.client.language = null;
            }
            const current = msg.guild ? msg.guild.language : this.client.language;
            return msg.reply(this.localization.tl('output.reset-default', msg.guild,
                { args, cmd: this, default: current }));
        }
        if (msg.guild) {
            msg.guild.language = language;
        } else {
            this.client.language = language;
        }

        return msg.reply(this.localization.tl('output.set-language', msg.guild, { args, cmd: this, language }));
    }
}

module.exports = CommandLanguage;
