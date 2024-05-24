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
        if (process.env.node_env == 'testing')
            return this.container.logger.error(error);
        await this.container.utility.exception(error, 'Command');
        if (error.message == 'Received one or more errors') {
            this.container.logger.error(
                'Logging in console because of multiple errors'
            );
            this.container.logger.error(error);
        }
        return payload.message.reply({
            content: `An error occured: ${error.message}`,
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }
}

module.exports = { MessageCommandErrorListener };
