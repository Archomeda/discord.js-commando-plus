/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed disambiguation() to formatDisambiguation()
 - Added support for localization
 */

const ArgumentType = require('./base');
const { escapeMarkdown } = require('discord.js');
const { formatDisambiguation } = require('../util');

class RoleArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'role');
    }

    validate(value, msg) {
        const matches = value.match(/^(?:<@&)?([0-9]+)>?$/);
        if (matches) {
            return msg.guild.roles.has(matches[1]);
        }
        const search = value.toLowerCase();
        let roles = msg.guild.roles.filterArray(nameFilterInexact(search));
        if (roles.length === 0) {
            return false;
        }
        if (roles.length === 1) {
            return true;
        }
        const exactRoles = roles.filter(nameFilterExact(search));
        if (exactRoles.length === 1) {
            return true;
        }
        if (exactRoles.length > 0) {
            roles = exactRoles;
        }
        return roles.length <= 15 ? `${formatDisambiguation(this.client, {
            label: this.client.localeProvider.tl('common', 'roles'),
            list: roles.map(role => `${escapeMarkdown(role.name)}`)
        })}\n` : this.client.localeProvider.tl('common', 'output-multiple-roles');
    }

    parse(value, msg) {
        const matches = value.match(/^(?:<@&)?([0-9]+)>?$/);
        if (matches) {
            return msg.guild.roles.get(matches[1]) || null;
        }
        const search = value.toLowerCase();
        const roles = msg.guild.roles.filterArray(nameFilterInexact(search));
        if (roles.length === 0) {
            return null;
        }
        if (roles.length === 1) {
            return roles[0];
        }
        const exactRoles = roles.filter(nameFilterExact(search));
        if (exactRoles.length === 1) {
            return exactRoles[0];
        }
        return null;
    }
}

function nameFilterExact(search) {
    return thing => thing.name.toLowerCase() === search;
}

function nameFilterInexact(search) {
    return thing => thing.name.toLowerCase().includes(search);
}

module.exports = RoleArgumentType;
