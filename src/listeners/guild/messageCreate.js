const { Listener, Events } = require('@sapphire/framework');
const { Message, MessageEmbed } = require('discord.js');
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
        if (message.channel.type === 'DM') {
            return this.redirectDM(message);
        }
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

        if (!redirCh || redirCh.type !== 'GUILD_TEXT') return;

        const attachments =
            message.attachments.size > 0
                ? [...message.attachments.values()]
                : null;

        const embed = new MessageEmbed()
            .setTitle(`I recieved a DM from ${message.author.tag}`)
            .setColor('RANDOM')
            .setDescription(
                `Content of DM recieved: ${
                    message.content.length > 0 ? message.content : 'No content'
                }`
            )
            .addFields({
                name: 'This message contained attachments.',
                value: `The following attachments were sent with this message:\n ${attachments
                    .map((a) => a.url)
                    .join('\n')}\n *They are also attached to this message.*`,
            })
            .setFooter({
                text: `You can reply to this DM by using the ?dm command, User ID: ${message.author.id}`,
            });

        return redirCh.send({
            content: attachments.length
                ? 'DM Recieved with embeds'
                : 'Plain text DM recieved',
            embeds: [embed],
            files: attachments,
        });
    }
}

module.exports = { MessageCreateListener };
