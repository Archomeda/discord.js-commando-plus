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
const Command = require('../../../commands/base');

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

class CommandEval extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            group: 'utils',
            module: 'builtin',
            memberName: 'eval',
            ownerOnly: true,

            args: [
                {
                    key: 'script',
                    type: 'string'
                }
            ]
        });

        this.lastResult = null;
    }

    run(msg, args) {
        const { script } = args;

        // Run the code and measure its execution time
        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(script); // eslint-disable-line no-eval
            hrDiff = process.hrtime(hrStart);
        } catch (err) {
            return msg.reply(this.localization.tl('output.evaluation-error', msg.guild, { args, err, cmd: this }));
        }

        // Prepare for callback time and respond
        let response = this.makeResultMessages(this.lastResult, hrDiff, msg, script);
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

    makeResultMessages(result, hrDiff, msg, input = null) {
        const inspected = util.inspect(result, { depth: 0 })
            .replace(nlPattern, '\n')
            .replace(this.sensitivePattern, this.localization.tl('partial.sensitive-censor', msg.guild, { cmd: this }));
        const split = inspected.split('\n');
        const last = inspected.length - 1;
        const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ?
            split[0] : inspected[0];
        const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\'' ?
            split[split.length - 1] : inspected[last];
        const prepend = `\`\`\`js\n${prependPart}\n`;
        const append = `\n${appendPart}\n\`\`\``;

        if (input) {
            /* eslint-disable indent */
            return discord.splitMessage(stripIndents`${msg.editable ? `
                    ${this.localization.tl('partial.input', msg.guild, { cmd: this })}
                    \`\`\`js
                    ${input}
                    \`\`\`` :
                ''}
                ${this.localization.tl(
                    'output.execution-time',
                    msg.guild,
                    { cmd: this, time: (hrDiff[0] * 1000) + (hrDiff[1] / 1000000) }
                )}
				\`\`\`js
				${inspected}
				\`\`\`
            `, 1900, '\n', prepend, append);
            /* eslint-enable indent */
        }
        return discord.splitMessage(stripIndents`${this.localization.tl(
            'output.callback-execution-time',
            msg.guild,
            { cmd: this, time: (hrDiff[0] * 1000) + (hrDiff[1] / 1000000) })}
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
}

module.exports = CommandEval;
