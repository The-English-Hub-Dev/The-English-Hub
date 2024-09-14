const { Command, Args } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const { Message, EmbedBuilder } = require('discord.js');

class SetstatusCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'setstatus',
            description: "Set's the bots status.",
            aliases: ['setactivity', 'sets', 'seta'],
            usage: '<type> <status>',
            preconditions: ['NotOrigCmdChannel', 'Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawType = await args.pickResult('enum', {
            enum: ['playing', 'watching', 'listening', 'competing'],
        });

        const type = rawType.unwrapOr('playing');
        const status = await args.restResult('string');

        if (status.isErr())
            return this.container.utility.errReply(
                message,
                'Please provide a status to set.'
            );

        clearInterval(this.container.intervals.status);
        this.container.client.user.setActivity(status.unwrap(), {
            type: type.toUpperCase(),
        });

        return message.reply(
            `Successfully set the bots status to ${type.toLowerCase()}: ${status.unwrap()}`
        );
    }
}

module.exports = { SetstatusCommand };
