const { Listener, Events } = require('@sapphire/framework');
const { Message, EmbedBuilder, ChannelType, Colors } = require('discord.js');
const {
    redirectDMChannelID,
    mainGuildID,
    logChannelID,
} = require('../../../config.json');

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
        if (message.author.bot) return;
        if (message.channel.type === ChannelType.DM) {
            await this.redirectDM(message);
            return this.logDM(message);
        }

        // await this.checkOldPrefix(message);

        await this.container.automodManager.runAutomodOnMessage(message);
        await this.container.triggerManager.runTriggersOnMessage(message);
    }

    /**
     *
     * @param { Message } message
     */
    async redirectDM(message) {
        const redirCh = this.container.client.guilds.cache
            .get(mainGuildID)
            .channels.cache.get(redirectDMChannelID);

        if (!redirCh || redirCh.type !== ChannelType.GuildText) return;

        const attachments =
            message.attachments.size > 0
                ? [...message.attachments.values()]
                : null;

        if (message.content.length > 4000) {
            return message.reply(
                'Your message is too long to be sent! The maximum length is 4000 characters. You can shorten your message and send it in multiple parts if needed.'
            );
        }

        const embed = new EmbedBuilder()
            .setTitle(`${message.author.tag} sent a DM!`)
            .setColor(Colors.DarkGreen)
            .setDescription(
                `${
                    message.content.length > 0
                        ? message.content
                        : 'No message content'
                }`
            )
            .setFooter({
                text: `Message Received through DM system`,
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
                ? 'DM received with attachments 🔗'
                : 'DM received',
            embeds: [embed],
            files: attachments,
        });
        await redirCh.send(
            `You can reply to this DM by using the ?dm command (?dm ${message.author.id} [your text here])\nUser Details: ${message.author} (${message.author.id})`
        );
    }

    /**
     *
     * @param { Message } message
     */
    async logDM(message) {
        const dmLog = this.container.client.guilds.cache
            .get(mainGuildID)
            .channels.cache.get(logChannelID);
        if (!dmLog || dmLog.type !== ChannelType.GuildText) return;

        const dmRecieveLogEmbed = new EmbedBuilder()
            .setTitle('DM Received')
            .setColor(Colors.DarkAqua)
            .setFields(
                {
                    name: 'Message Author',
                    value: `${message.author} (${message.author.id})`,
                },
                {
                    name: 'Message Content',
                    value: message.content,
                }
            )
            .setFooter({
                text: 'Message recieved at',
                iconURL: message.author.avatarURL(),
            })
            .setTimestamp(message.createdTimestamp);

        return dmLog.send({ embeds: [dmRecieveLogEmbed] });
    }

    /**
     *
     * @param { Message } message
     */
    async checkOldPrefix(message) {
        if (this.container.utility.isStaff(message)) return;
        const currentCmds = this.container.stores
            .get('commands')
            .map((cmd) => cmd.name);
        const oldPrefixes = ['?'];

        for (let x = 0; x < oldPrefixes.length; x++) {
            if (message.content.startsWith(oldPrefixes[x])) {
                const cmd = message.content
                    .split(' ')[0]
                    .slice(oldPrefixes[x].length)
                    .trim();
                if (currentCmds.includes(cmd)) {
                    return message.reply({
                        content: `The bot prefix has been changed to \`??\` from \`?\`. Please use \`??${cmd}\` to run your command.`,
                        allowedMentions: { repliedUser: false },
                    });
                }
            }
        }
    }
}

module.exports = { MessageCreateListener };
