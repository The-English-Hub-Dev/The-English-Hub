const { Listener, Events } = require('@sapphire/framework');
const { Message } = require('discord.js');

class MessageCreateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            name: Events.MessageCreate,
            event: Events.MessageCreate,
        });
    }

    /**
     *
     * @param { Message } message
     */
    async run(message) {
        if (message.channel.type === 'DM') {
        }
    }
}

module.exports = { MessageCreateListener };
