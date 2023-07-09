const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    GuildMember,
    ChannelType,
} = require('discord.js');
const { logChannel } = require('../../../config.json');

class DmCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'dm',
            aliases: ['dmmember'],
            description:
                'DMs a member in the server with a specified message. You can also include attachments.',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        if (rawMember.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to send a DM to.'
            );

        const msg = await args.restResult('string');
        if (msg.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a message to send to the member.'
            );
        if (msg.unwrap().length > 1000)
            return this.container.utility.errReply(
                message,
                'The message length may not be greater than 1000 characters.'
            );

        const member = rawMember.unwrap();

        if (msg.unwrap().length > 4000)
            return this.container.utility.errReply(
                message,
                'The message length may not be greater than 4000 characters.'
            );

        const attachments =
            message.attachments.size > 0
                ? [...message.attachments.values()]
                : null;

        const dmEmbed = new EmbedBuilder()
            .setTitle("You've recieved a new message!")
            .setDescription(`**Message:** ${msg.unwrap()}\n\n`)
            .setFooter({ text: `Sent by ${message.guild.name} Staff` })
            .setColor(Colors.Blue);

        const successful = await member
            .send({ embeds: [dmEmbed] })
            .catch(() => null);

        if (!successful)
            return message.reply({
                embeds: new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setFooter({
                        text: message.guild.name,
                        iconURL: message.guild.iconURL(),
                    })
                    .setDescription(
                        `Couldn't send the message to that user. They most likely have their DM's closed.`
                    ),
            });

        if (attachments) {
            member.send({
                content:
                    'This message contained attachments. They are attached to this message.',
                files: attachments,
            });
        }

        await member.send(
            'To reply to this message, just reply to me. Your message will be sent to the staff team and they will respond when they are available.'
        );

        await this.logDMSent(message, member, msg.unwrap());

        return message.reply({
            embeds: new EmbedBuilder()
                .setColor(Colors.Green)
                .setFooter({
                    text: message.guild.name,
                    iconURL: message.guild.iconURL(),
                })
                .setDescription(
                    `Successfully sent DM to ${member} (${member.user.tag}). ${
                        attachments
                            ? `You sent ${attachments.length} attachments with your message.`
                            : ''
                    }`
                ),
            allowedMentions: {
                users: [],
                roles: [],
                parse: [],
                repliedUser: true,
            },
        });
    }

    /**
     *
     * @param { Message } message
     * @param { GuildMember } member
     * @param { String } dm
     */
    async logDMSent(message, member, dm) {
        const dmLog = message.guild.channels.cache.get(logChannel);
        if (!dmLog || dmLog.type !== ChannelType.GuildText) return;

        const dmSentEmbed = new EmbedBuilder()
            .setTitle('DM Sent')
            .setColor(Colors.Blurple)
            .setFields(
                {
                    name: 'User sent to',
                    value: `${member} (${member.id})`,
                    inline: true,
                },
                {
                    name: 'Sending staff',
                    value: `${message.member} (${message.member.id})`,
                    inline: true,
                },
                { name: 'Message Content', value: dm }
            )
            .setFooter({ text: `Sent at` })
            .setTimestamp();

        return dmLog.send({ embeds: [dmSentEmbed] });
    }
}

module.exports = { DmCommand };
