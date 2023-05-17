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
            .setTitle(`${message.author.tag} sent a DM!`)
            .setColor('Random')
            .setDescription(
                `${
                    message.content.length > 0
                        ? message.content
                        : 'No message content'
                }`
            )
            .setFooter({
                text: `Message Recieved through DM system`,
            })
            .setTimestamp(message.createdTimestamp);

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
                        'Your DM has been sent to the server staff. ✅'
                    )
                    .setColor(Colors.Green),
            ],
        });

        await redirCh.send({
            content: attachments
                ? 'DM recieved with attachments 🔗'
                : 'DM recieved',
            embeds: [embed],
            files: attachments,
        });
        await redirCh.send(
            `You can reply to this DM by using the ?dm command\nUser Details: ${message.author} (${message.author.id})`
        );
    }
}

module.exports = { MessageCreateListener };
