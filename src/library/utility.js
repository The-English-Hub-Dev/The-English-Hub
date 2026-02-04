const { container } = require('@sapphire/pieces');
const Sentry = require('@sentry/node');
const { Message, EmbedBuilder, Colors } = require('discord.js');
const { staffRoles } = require('../../config.json');

class Utility {
    constructor() {
        // Track timeouts for proper cleanup
        this.timeouts = new Set();
    }

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
        // Use slice instead of shift for better performance
        if (container.logger.errorLogs.length > 1000) {
            container.logger.errorLogs =
                container.logger.errorLogs.slice(-1000);
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

        // Schedule deletion of both messages independently after 5 seconds
        const timeoutId = setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
            this.timeouts.delete(timeoutId);
        }, 5000);
        this.timeouts.add(timeoutId);
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

    /**
     * Cleanup method to prevent memory leaks
     * Clears all pending timeouts when utility is destroyed
     */
    cleanup() {
        for (const timeoutId of this.timeouts) {
            clearTimeout(timeoutId);
        }
        this.timeouts.clear();
        container.logger.info('Utility: All timeouts cleared.');
    }
}

module.exports = { Utility };
