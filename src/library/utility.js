const { container } = require('@sapphire/pieces');
const Sentry = require('@sentry/node');
const { Message, EmbedBuilder, Colors } = require('discord.js');
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
        const errEmbed = new EmbedBuilder()
            .setDescription(error)
            .setColor(Colors.Red);

        const reply = await message.reply({
            embeds: [errEmbed],
            allowedMentions: { users: [], roles: [], parse: [] },
        });

        return setTimeout(() => {
            message.delete().then(reply.delete());
        }, 5000);
    }

    /**
     *
     * @param { Message } message
     */
    async isStaff(message) {
        if (!message.member) return false;
        return (
            await container.stores
                .get('preconditions')
                .get('Staff')
                .messageRun(message)
        ).isOk();
    }

    /**
     *
     * @param { String } text
     * @returns
     */
    async createHastebin(text, extension = 'txt') {
        const res = await fetch('https://hastebin.com/documents', {
            method: 'POST',
            body: text,
            headers: {
                Authorization: `Bearer ${process.env.HASTEBIN_API_KEY}`,
            },
        });
        if (res.status !== 200) {
            return 'An error occurred while trying to upload the content to hastebin :(';
        }
        return `https://hastebin.com/share/${
            (await res.json()).key
        }.${extension}`;
    }
}

module.exports = { Utility };
