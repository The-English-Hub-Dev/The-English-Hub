const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class SayCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'say',
            description: 'Says things you tell the bot to say.',
            aliases: ['echo'],
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const text = await args.restResult('string');
        if (!text.success)
            return this.container.utility.errReply(
                message,
                'You must provide something to say.'
            );

        return message.channel.send({
            content: text.value,
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }
}
module.exports = { SayCommand };
