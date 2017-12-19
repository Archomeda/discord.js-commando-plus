/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed disambiguation() to formatDisambiguation()
 - Added support for localization
 */

const ArgumentType = require('./base');
const { escapeMarkdown } = require('discord.js');
const { formatDisambiguation } = require('../util');

class MemberArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'member');
    }

    async validate(value, msg) {
        const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches) {
            try {
                return await msg.guild.fetchMember(await msg.client.fetchUser(matches[1]));
            } catch (err) {
                return false;
            }
        }
        const search = value.toLowerCase();
        let members = msg.guild.members.filterArray(memberFilterInexact(search));
        if (members.length === 0) {
            return false;
        }
        if (members.length === 1) {
            return members[0];
        }
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.length === 1) {
            return exactMembers[0];
        }
        if (exactMembers.length > 0) {
            members = exactMembers;
        }
        return members.length <= 15 ? `${formatDisambiguation(msg.guild, {
            label: this.client.localization.tl('glossary', 'members', msg.guild),
            list: members.map(mem => `${escapeMarkdown(mem.user.tag)}`)
        })}\n` : this.client.localization.tl('common', 'disambiguation-members', msg.guild);
    }

    parse(value, msg) {
        const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches) {
            return msg.guild.member(matches[1]) || null;
        }
        const search = value.toLowerCase();
        const members = msg.guild.members.filterArray(memberFilterInexact(search));
        if (members.length === 0) {
            return null;
        }
        if (members.length === 1) {
            return members[0];
        }
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.length === 1) {
            return exactMembers[0];
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

module.exports = MemberArgumentType;
