/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Renamed disambiguation() to formatDisambiguation()
 - Changed formatDisambiguation()
 - Added formatFirstLetter()
 */

/**
 * @typedef {Object} DisambiguationList
 * @property {string} label - The list label
 * @property {string[]} list - The item list
 */

/**
 * Formats a disambiguation message.
 * @param {Guild} guild - The guild for which this message will be formatted
 * @param {DisambiguationList|DisambiguationList[]} items - The item(s)
 * @return {string} The formatted disambiguation message.
 */
function formatDisambiguation(guild, items) {
    if (!items || (Array.isArray(items) && items.length === 0)) {
        return '';
    }
    if (!Array.isArray(items)) {
        items = [items];
    }
    if (items.length === 1) {
        const itemList = items[0].list.map(i => i.replace(/ /g, '\xa0')).join(', ');
        return guild.client.localization.tl('common', 'disambiguation-single', guild, {
            label: formatFirstLetter(items[0].label, true),
            items: itemList
        });
    }

    const resultList = [];
    for (const subItems of items) {
        const itemList = subItems.list.map(i => i.replace(/ /g, '\xa0')).join(', ');
        resultList.push(guild.client.localization.tl('common', 'disambiguation-list', guild, {
            label: formatFirstLetter(subItems.label, false),
            items: itemList
        }));
    }
    return guild.client.localization.tl('common', 'disambiguation-multiple', guild, { items: resultList.join('\n') });
}

/**
 * Formats text where the first letter should be lowercase or uppercase.
 * @param {string} text - The text; should start with [X|x] where X is the uppercase letter(s)
 * and x the lowercase letter(s) (skips every character until [X|x] has been found)
 * @param {boolean} [lowercase=false] - True for lowercase, false for uppercase
 * @return {string} The formatted text.
 */
function formatFirstLetter(text, lowercase = false) {
    const token = lowercase ? '$1$3' : '$1$2';
    text = text.replace(/^(.*?)\[([^|]+)\|([^\]]+)]/, token);
    return text;
}

function paginate(items, page = 1, pageLength = 10) {
    const maxPage = Math.ceil(items.length / pageLength);
    if (page < 1) {
        page = 1;
    }
    if (page > maxPage) {
        page = maxPage;
    }
    const startIndex = (page - 1) * pageLength;
    return {
        items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
        page,
        maxPage,
        pageLength
    };
}

const permissions = {
    ADMINISTRATOR: 'Administrator',
    VIEW_AUDIT_LOG: 'View audit log',
    MANAGE_GUILD: 'Manage server',
    MANAGE_ROLES: 'Manage roles',
    MANAGE_CHANNELS: 'Manage channels',
    KICK_MEMBERS: 'Kick members',
    BAN_MEMBERS: 'Ban members',
    CREATE_INSTANT_INVITE: 'Create instant invite',
    CHANGE_NICKNAME: 'Change nickname',
    MANAGE_NICKNAMES: 'Manage nicknames',
    MANAGE_EMOJIS: 'Manage emojis',
    MANAGE_WEBHOOKS: 'Manage webhooks',
    VIEW_CHANNEL: 'Read text channels and see voice channels',
    SEND_MESSAGES: 'Send messages',
    SEND_TTS_MESSAGES: 'Send TTS messages',
    MANAGE_MESSAGES: 'Manage messages',
    EMBED_LINKS: 'Embed links',
    ATTACH_FILES: 'Attach files',
    READ_MESSAGE_HISTORY: 'Read message history',
    MENTION_EVERYONE: 'Mention everyone',
    USE_EXTERNAL_EMOJIS: 'Use external emojis',
    ADD_REACTIONS: 'Add reactions',
    CONNECT: 'Connect',
    SPEAK: 'Speak',
    MUTE_MEMBERS: 'Mute members',
    DEAFEN_MEMBERS: 'Deafen members',
    MOVE_MEMBERS: 'Move members',
    USE_VAD: 'Use voice activity'
};

module.exports = {
    formatDisambiguation,
    formatFirstLetter,
    paginate,
    permissions
};
