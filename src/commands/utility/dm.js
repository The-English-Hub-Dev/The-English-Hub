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
            description: 'DMs a member in the server with a specified message',
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

        const dmEmbed = new EmbedBuilder()
            .setTitle("You've recieved a new message!")
            .setDescription(`**Message:** ${msg.unwrap()}\n\n`)
            .setFooter({ text: `Sent by ${message.guild.name} Staff` })
            .setColor(Colors.Blue);

        const successful = await member
            .send({ embeds: [dmEmbed] })
            .catch(() => null);
        if (!successful)
            return message.reply(
                `Couldn't send the message to that user. They most likely have their DM's closed.`
            );
        else {
            member.send(
                'To reply to this message, just reply to me. Your message will be sent to the staff team.'
            );
        }

        await this.logDMSent(message, member, msg.unwrap());

        return message.reply({
            content: `Successfully sent DM to ${member} (${member.user.tag}).`,
            allowedMentions: {
                users: [message.member.user.id],
                roles: [],
                parse: [],
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

        const dmSentEmbed = new EmbedBuilder().setTitle('DM Sent').setFields(
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
        );

        return dmLog.send({ embeds: [dmSentEmbed] });
    }
}

module.exports = { DmCommand };
