const { Listener, Events, MessageCommand } = require('@sapphire/framework');
const { Message } = require('discord.js');

class MessageCommandFinishListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            name: Events.MessageCommandFinish,
            event: Events.MessageCommandFinish,
        });
    }

    /**
     *
     * @param { Message } message
     * @param { MessageCommand } command
     */
    async run(message, command) {
        if (command.category.toLowerCase() === 'moderation') {
            message.reply({
                content:
                    'Moderation commands are not fully implemented yet. Use with caution.',
                allowedMentions: { repliedUser: false },
            });
        }

        this.container.logger.commandLogs.push(
            `Command ${command.name} executed by ${message.author.tag}.`
        );
        this.container.logger.info(
            `Command ${command.name} executed by ${message.author.tag}.`
        );
    }
}

module.exports = { MessageCommandFinishListener };
