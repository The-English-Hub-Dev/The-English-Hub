const { Command, Args } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const { Message, MessageEmbed } = require('discord.js');

class SetstatusCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'setstatus',
            description: "Set's the bots status.",
            aliases: ['setactivity', 'sets', 'seta'],
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawType = await args.pickResult('enum', {
            enums: ['PLAYING', 'WATCHING', 'LISTENING', 'COMPETING'],
        });

        const type = rawType.unwrapOr('PLAYING');
        const status = await args.restResult('string');

        if (status.isErr())
            return this.container.utility.errReply(
                message,
                'Please provide a status to set.'
            );

        clearInterval(this.container.intervals.status);
        this.container.client.user.setActivity(status.unwrap(), { type: type });

        return message.reply(
            `Successfully set the bots status to ${type.toLowerCase()}: ${status.unwrap()}`
        );
    }
}

module.exports = { SetstatusCommand };
