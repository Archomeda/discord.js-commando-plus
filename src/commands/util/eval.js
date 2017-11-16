/*
 Original author: Gawdl3y
 Modified by: Archomeda
 - Changed EvalCommand.run()
 - Added support for localization
 */

const util = require('util');
const { stripIndents } = require('common-tags');
const discord = require('discord.js');
const escapeRegex = require('escape-string-regexp');
const Command = require('../base');

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            group: 'util',
            memberName: 'eval',
            description: client.localeProvider.tl('help', 'utils.eval.description'),
            details: client.localeProvider.tl('help', 'utils.eval.details'),
            ownerOnly: true,

            args: [
                {
                    key: 'script',
                    prompt: client.localeProvider.tl('help', 'utils.eval.args.script-prompt'),
                    type: 'string'
                }
            ]
        });

        this.lastResult = null;
    }

    async run(msg, args) {
        await this.client.localeProvider.preloadNamespace('utils');
        const l10n = this.client.localeProvider;

        const { script } = args;

        // Run the code and measure its execution time
        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(script); // eslint-disable-line no-eval
            hrDiff = process.hrtime(hrStart);
        } catch (err) {
            return msg.reply(l10n.tl('utils', 'eval.output-evaluation-error', { err }));
        }

        // Prepare for callback time and respond
        let response = this.makeResultMessages(this.lastResult, hrDiff, script, msg.editable);
        if (msg.editable) {
            if (Array.isArray(response)) {
                if (response.length > 0) {
                    response = response.slice(1, response.length - 1);
                }
                for (const re of response) {
                    msg.say(re);
                }
                return null;
            }
            return msg.edit(response);
        }
        return msg.reply(response);
    }

    makeResultMessages(result, hrDiff, input = null, editable = false) {
        const l10n = this.client.localeProvider;

        const inspected = util.inspect(result, { depth: 0 })
            .replace(nlPattern, '\n')
            .replace(this.sensitivePattern, l10n.tl('utils', 'eval.sensitive-censor'));
        const split = inspected.split('\n');
        const last = inspected.length - 1;
        const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ?
            split[0] : inspected[0];
        const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\'' ?
            split[split.length - 1] : inspected[last];
        const prepend = `\`\`\`js\n${prependPart}\n`;
        const append = `\n${appendPart}\n\`\`\``;

        if (input) {
            return discord.splitMessage(stripIndents`${editable ? `
                    ${l10n.tl('utils', 'eval.input')}
                    \`\`\`js
                    ${input}
                    \`\`\`` :
                ''}
                ${l10n.tl('utils', 'eval.output-execution-time', { time: (hrDiff[0] * 1000) + (hrDiff[1] / 1000000) })}
				\`\`\`js
				${inspected}
				\`\`\`
            `, 1900, '\n', prepend, append);
        }
        return discord.splitMessage(stripIndents`${l10n.tl('utils', 'eval.output-callback-execution-time',
            { time: (hrDiff[0] * 1000) + (hrDiff[1] / 1000000) })}
                \`\`\`js
                ${inspected}
                \`\`\`
            `, 1900, '\n', prepend, append);
    }

    get sensitivePattern() {
        if (!this._sensitivePattern) {
            const client = this.client;
            let pattern = '';
            if (client.token) {
                pattern += escapeRegex(client.token);
            }
            Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') });
        }
        return this._sensitivePattern;
    }
};
