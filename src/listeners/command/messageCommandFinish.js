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
        // Add to command logs with size limit to prevent memory leak
        if (!this.container.logger.commandLogs) {
            this.container.logger.commandLogs = [];
        }
        this.container.logger.commandLogs.push(
            `Command ${command.name} executed by ${message.author.tag}.`
        );

        // Keep only last 1000 commands to prevent unbounded growth
        if (this.container.logger.commandLogs.length > 1000) {
            this.container.logger.commandLogs.shift();
        }

        this.container.logger.info(
            `Command ${command.name} executed by ${message.author.tag}.`
        );
    }
}

module.exports = { MessageCommandFinishListener };
