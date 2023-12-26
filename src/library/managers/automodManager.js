const { DiscordInviteLinkRegex } = require('@sapphire/discord-utilities');
const { container } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    time,
    TimestampStyles,
    Colors,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');
const logChannel = container.client.channels.cache.get(logChannelID);

class AutomodManager {
    constructor() {}

    /**
     *
     * @param { Message } message
     */
    async runAutomodOnMessage(message) {
        let msgOk = true;
        if (message.author.bot) return true;

        if (await container.utility.isStaff(message)) {
            return true;
        }

        if (msgOk) msgOk = await this.discordInviteCheck(message);
        if (msgOk) msgOk = await this.walltextCheck(message);

        return msgOk;
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async discordInviteCheck(message) {
        const inviteLink = DiscordInviteLinkRegex.exec(message.content);
        if (inviteLink && inviteLink[0] !== 'discord.gg/enghub') {
            const logEmbed = new EmbedBuilder()
                .setTitle('Invite Link Auto Moderation')
                .setColor(Colors.Red)
                .addFields(
                    {
                        name: 'Message Content',
                        value: message.content,
                        inline: true,
                    },
                    {
                        name: 'User',
                        value: message.author.username,
                        inline: true,
                    },
                    {
                        name: 'Date',
                        value: time(new Date(), TimestampStyles.LongDateTime),
                        inline: true,
                    },
                    {
                        name: 'Link to message',
                        value: `[Message URL](${message.url})`,
                        inline: true,
                    }
                );

            if (message.deletable) await message.delete();
            const reply = await message.channel.send(
                `${message.author}, you are not allowed to send invite links in this server.`
            );
            await logChannel.send({
                embeds: [logEmbed],
            });
            setTimeout(() => reply.delete(), 4000);
            return false;
        }
        return true;
    }

    /**
     *
     * @param { Message } message
     */
    async walltextCheck(message) {
        const messageLines = message.content.split('\n');
        if (messageLines.length > 15 || message.content.length > 2000) {
            const logEmbed = new EmbedBuilder()
                .setTitle('Walltext Auto Moderation')
                .setColor(Colors.Red)
                .addFields(
                    {
                        name: 'Message Content',
                        value: message.content,
                        inline: true,
                    },
                    {
                        name: 'User',
                        value: message.author.username,
                        inline: true,
                    },
                    {
                        name: 'Date',
                        value: time(new Date(), TimestampStyles.LongDateTime),
                        inline: true,
                    },
                    {
                        name: 'Link to message',
                        value: `[Message URL](${message.url})`,
                        inline: true,
                    }
                );
            if (message.deletable) await message.delete();
            const reply = await message.channel.send(
                `${message.author}, your message is too many lines/too long and spams the chat. Please shorten it.`
            );
            await logChannel.send({
                embeds: [logEmbed],
            });
            setTimeout(() => reply.delete(), 4000);
            return false;
        }
        return true;
    }
}

module.exports = { AutomodManager };
