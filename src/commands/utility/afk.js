const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class AFKCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'afk',
            description: 'Set your AFK status to be tracked by the bot.',
            aliases: ['away', 'bye', 'busy'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const rawReason = await args.restResult('string');

        const reason = rawReason.unwrapOr('No reason provided.');

        await this.container.redis.hset(
            'afk',
            message.author.id,
            `${Date.now()}:${reason}`
        );

        return message.reply(`You are AFK: ${reason}`);
    }
}

module.exports = { AFKCommand };
