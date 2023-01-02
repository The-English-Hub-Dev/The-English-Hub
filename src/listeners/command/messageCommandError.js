const {
    Listener,
    Events,
    MessageCommandErrorPayload,
} = require('@sapphire/framework');
const Sentry = require('@sentry/node');

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
        await this.container.utility.exception(error, 'Command');
        return payload.message.reply({
            content: `An error occured: ${error.message}`,
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }
}

module.exports = { MessageCommandErrorListener };
