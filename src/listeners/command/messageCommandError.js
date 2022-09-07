const {
    Listener,
    Events,
    MessageCommandErrorPayload,
} = require('@sapphire/framework');

class MessageCommandErrorListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            name: Events.MessageCommandError,
            event: Events.MessageCommandError,
        });
    }

    /**
     *
     * @param { Error } error
     * @param { MessageCommandErrorPayload } payload
     */
    async run(error, payload) {
        this.container.logger.error(error);
        return payload.message.reply({
            content: `An error occured: ${error.message}`,
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }
}

module.exports = { MessageCommandErrorListener };
