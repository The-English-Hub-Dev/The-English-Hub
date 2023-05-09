const { container } = require('@sapphire/pieces');
const Sentry = require('@sentry/node');
const { Message } = require('discord.js');
const { staffRoles } = require('../../config.json');

class Utility {
    constructor() {}

    /**
     *
     * @param { Sentry.Exception } exception
     * @param { String } type
     */
    async exception(exception, type) {
        const sentryID = Sentry.captureException(exception);
        container.logger.errorLogs.push(exception);
        container.logger.error(
            `${type} exception with ID ${sentryID} sent to Sentry`
        );
        return sentryID;
    }

    /**
     *
     * @param { Message } message
     * @param { String } error
     */
    async errReply(message, error) {
        const reply = await message.reply({
            content: error,
            allowedMentions: { users: [], roles: [], parse: [] },
        });
        return setTimeout(() => {
            message.delete();
            reply.delete();
        }, 3500);
    }

    /**
     *
     * @param { Message } message
     */
    async isStaff(message) {
        return (
            await container.stores
                .get('preconditions')
                .get('Staff')
                .messageRun(message)
        ).isOk();
    }
}

module.exports = { Utility };
