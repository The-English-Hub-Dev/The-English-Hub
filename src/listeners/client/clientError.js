const { Listener, Events } = require('@sapphire/framework');
const Sentry = require('@sentry/node');

class ClientErrorListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'clientError',
            event: Events.Error,
        });
    }

    /**
     *
     * @param { Error } error
     */
    async run(error) {
        await this.container.utility.exception(error, 'Client');
    }
}

module.exports = { ClientErrorListener };
