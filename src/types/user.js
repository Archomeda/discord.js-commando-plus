/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed disambiguation() to formatDisambiguation()
 - Added support for localization
 */

const ArgumentType = require('./base');
const { escapeMarkdown } = require('discord.js');
const { formatDisambiguation } = require('../util');

class UserArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'user');
    }

    async validate(value, msg) {
        const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches) {
            try {
                return await msg.client.fetchUser(matches[1]);
            } catch (err) {
                return false;
            }
        }
        if (!msg.guild) {
            return false;
        }
        const search = value.toLowerCase();
        let members = msg.guild.members.filterArray(memberFilterInexact(search));
        if (members.length === 0) {
            return false;
        }
        if (members.length === 1) {
            return true;
        }
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.length === 1) {
            return true;
        }
        if (exactMembers.length > 0) {
            members = exactMembers;
        }
        return members.length <= 15 ? `${formatDisambiguation(msg.guild, {
            label: this.client.localization.tl('glossary', 'users', msg.guild),
            list: members.map(mem => `${escapeMarkdown(mem.user.tag)}`)
        })}\n` : this.client.localization.tl('common', 'disambiguation-users', msg.guild);
    }

    parse(value, msg) {
        const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches) {
            return msg.client.users.get(matches[1]) || null;
        }
        if (!msg.guild) {
            return null;
        }
        const search = value.toLowerCase();
        const members = msg.guild.members.filterArray(memberFilterInexact(search));
        if (members.length === 0) {
            return null;
        }
        if (members.length === 1) {
            return members[0].user;
        }
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.length === 1) {
            return exactMembers[0].user;
        }
        return null;
    }
}

function memberFilterExact(search) {
    return mem => mem.user.username.toLowerCase() === search ||
    (mem.nickname && mem.nickname.toLowerCase() === search) ||
    `${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search) {
    return mem => mem.user.username.toLowerCase().includes(search) ||
    (mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
    `${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}

module.exports = UserArgumentType;
