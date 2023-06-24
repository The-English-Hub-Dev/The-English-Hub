const { Command, Args } = require('@sapphire/framework');
const { EmbedBuilder, Message } = require('discord.js');
const { evaluate } = require('mathjs');

class PingCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'calculate',
            aliases: ['calc', 'math'],
            description: 'Calculates a math expression',
            preconditions: [],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const expr = await args.restResult('string');
        if (expr.isErr())
            return this.container.utility.errReply(
                message,
                'Provide an expression to evaluate.'
            );

        const result = evaluate(expr.value);

        const contentEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Calculation')
            .addFields(
                {
                    name: 'Input',
                    value: expr,
                },
                {
                    name: 'Evaluated',
                    value: result,
                }
            );

        return message.reply({ embeds: [contentEmbed] });
    }
}

module.exports = { PingCommand };
