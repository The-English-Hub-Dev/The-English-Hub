const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    time,
    TimestampStyles,
    Colors,
    EmbedBuilder,
    GuildMember,
    VoiceChannel,
} = require('discord.js');
const { logChannel } = require('../../../config.json');

class VcUnbanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'vcunban',
            aliases: ['vcunbanish', 'vcunrestrict'],
            description:
                'Lets a member join the specified vc and send a message in its vc chat.',
            preconditions: ['Staff'],
            usage: '<channel: VoiceChannel> <member> [reason]',
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawvChannel = await args.pickResult('guildVoiceChannel');
        const rawMember = await args.pickResult('member');
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );

        if (rawvChannel.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid voice channel to unban from.'
            );
        }
        const vChannel = rawvChannel.unwrap();
        if (vChannel.parent.id !== '1218635207926743182')
            return this.container.utility.errReply(
                message,
                'You may only vc unban members from channels in the `Guest Rooms` category.'
            );

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid user to unban from a vc.'
            );
        }
        const member = rawMember.unwrap();

        if (member) {
            if (
                message.member.roles.highest.position <=
                member.roles.highest.position
            ) {
                return this.container.utility.errReply(
                    message,
                    'You may not vc unban members with equal or higher roles than you.'
                );
            }
        }

        await this.sendMemberDM(message, member, reason, vChannel);

        if (
            vChannel.permissionsFor(member).has('Connect') &&
            vChannel.permissionsFor(member).has('SendMessages')
        )
            return this.container.utility.errReply(
                message,
                `${member} is already banned from the vc ${vChannel}.`
            );

        await vChannel.permissionOverwrites.delete(
            member,
            `Removing vc ban overwrites. Command executed by ${message.author.tag} (${message.author.id})`
        );

        await this.logVcUnban(message, member, reason, vChannel);

        const vcBanEmbed = new EmbedBuilder()
            .setDescription(
                `${member} has been unbanned from the vc ${vChannel}.`
            )
            .setColor(Colors.DarkGreen);
        return message.reply({ embeds: [vcBanEmbed] });
    }

    /**
     *
     * @param { Message } message
     * @param { GuildMember} member
     * @param { String} reason
     * @param { VoiceChannel } vc
     */
    async sendMemberDM(message, member, reason, vc) {
        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`You were unbanned from the vc ${vc}`)
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL(),
            })
            .addFields({ name: 'Reason', value: reason })
            .setTimestamp();

        return member.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    /**
     *
     * @param { Message } message
     * @param { GuildMember } member
     * @param { String } reason
     * @returns
     */
    async logVcUnban(message, member, reason) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle('VC Unban')
            .setAuthor({
                name: member.user.tag,
                iconURL: member.user.avatarURL(),
            })
            .addFields(
                {
                    name: 'User',
                    value: `${member.user.tag} (${member.user.id})`,
                },
                {
                    name: 'Moderator',
                    value: `${message.author.tag} (${message.author.id})`,
                },
                { name: 'Reason', value: reason },
                {
                    name: 'Date',
                    value: time(new Date(), TimestampStyles.LongDateTime),
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(logChannel);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] });
    }
}

module.exports = { VcUnbanCommand };
