const { Command } = require('@sapphire/framework');
const { Message } = require('discord.js');

class RestartCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'restart',
            aliases: ['reboot'],
            preconditions: ['Admin'],
            description: 'Restarts The English Hub.',
        });
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        await message.reply('The bot is restarting...');
        this.container.logger.warn(
            `Restart signal sent by ${message.member.user.tag}`
        );

        await this.container.redis.hset(
            'tasks',
            'restart',
            `${message.channel.id}:${Date.now().toString()}`
        );

        return process.exit();
    }
}

module.exports = { RestartCommand };
