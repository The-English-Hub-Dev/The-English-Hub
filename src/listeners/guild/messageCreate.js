const { Listener, Events } = require('@sapphire/framework');
const { Message, EmbedBuilder, ChannelType, Colors } = require('discord.js');
const { redirectDMChannelID, mainGuildID } = require('../../../config.json');

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
        if (message.channel.partial) await message.channel.fetch();
        if (message.channel.type === ChannelType.DM) {
            return this.redirectDM(message);
        }

        // await this.container.automodManager.runAutomodOnMessage(message);
    }

    /**
     *
     * @param { Message } message
     */
    async redirectDM(message) {
        if (message.author.bot) return;
        const redirCh = this.container.client.guilds.cache
            .get(mainGuildID)
            .channels.cache.get(redirectDMChannelID);

        if (!redirCh || redirCh.type !== ChannelType.GuildText) return;

        const attachments =
            message.attachments.size > 0
                ? [...message.attachments.values()]
                : null;

        const embed = new EmbedBuilder()
            .setTitle(`I recieved a DM from ${message.author.tag}`)
            .setColor('Random')
            .setDescription(
                `Content of DM recieved: ${
                    message.content.length > 0 ? message.content : 'No content'
                }`
            )
            .setFooter({
                text: `You can reply to this DM by using the ?dm command, User ID: ${message.author.id}`,
            });

        if (attachments) {
            embed.addFields({
                name: 'This message contained attachments.',
                value: `The following attachments were sent with this message:\n ${attachments
                    .map((a) => a.url)
                    .join('\n')}\n *They are also attached to this message.*`,
            });
        }

        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        'Your DM has been sent to the server staff.'
                    )
                    .setColor(Colors.Green),
            ],
        });

        return redirCh.send({
            content: attachments
                ? 'DM Recieved with attachments'
                : 'Plain text DM recieved',
            embeds: [embed],
            files: attachments,
        });
    }
}

module.exports = { MessageCreateListener };
