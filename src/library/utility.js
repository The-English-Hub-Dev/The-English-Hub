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
        
        // Add to error logs with size limit to prevent memory leak
        if (!container.logger.errorLogs) {
            container.logger.errorLogs = [];
        }
        container.logger.errorLogs.push(exception);
        
        // Keep only last 1000 errors to prevent unbounded growth
        if (container.logger.errorLogs.length > 1000) {
            container.logger.errorLogs.shift();
        }
        
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
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
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
