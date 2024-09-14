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
const {
    vcbanlogChannelID,
    vcBanUnbanManagedCategories,
} = require('../../../config.json');
const { Time } = require('@sapphire/time-utilities');

class VcBanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'vcban',
            aliases: ['vcb', 'vcbanish', 'vcrestrict'],
            description:
                'Prevents a member from joining the specified vc and sending a message in its vc chat.',
            preconditions: ['NotOrigCmdChannel', 'VcActionPerms'],
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
                'You must provide a valid voice channel to ban from.'
            );
        }

        const vChannel = rawvChannel.unwrap();
        if (!vcBanUnbanManagedCategories.includes(vChannel.parent.id))
            return this.container.utility.errReply(
                message,
                'You may only vc ban members from channels in the `Guest Rooms` category.'
            );

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid user to ban from a vc.'
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
                    'You may not vc ban members with equal or higher roles than you.'
                );
            }
        }

        await this.sendMemberDM(message, member, reason, vChannel);

        await vChannel.permissionOverwrites.edit(
            member,
            {
                Connect: false,
                SendMessages: false,
            },
            {
                reason: `Adding vc ban overwrites. Command executed by ${message.author.tag} (${message.author.id})`,
            }
        );

        if (member.voice.channel) {
            await member.voice.disconnect(
                `Disconnecting as a result of a vc ban. Command executed by ${message.author.tag} (${message.author.id})`
            );
        }

        await this.container.redis.hset(
            'vcban',
            `${vChannel.id}:${member.id}`,
            Date.now()
        );

        await this.logVcBan(message, member, reason, vChannel);

        const vcBanEmbed = new EmbedBuilder()
            .setDescription(
                `${member} has been banned from the vc ${vChannel} for 24 hours.`
            )
            .setColor(Colors.Red);
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
            .setTitle(`You were banned from the vc ${vc}`)
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL(),
            })
            .addFields({ name: 'Reason', value: reason })
            .setDescription(
                'This ban will automatically expire in 24 hours. You will recieve a DM when you are unbanned.'
            )
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
    async logVcBan(message, member, reason) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle('VC Ban')
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
                },
                {
                    name: 'Expires',
                    value: time(
                        new Date(Date.now() + Time.Day),
                        TimestampStyles.LongDateTime
                    ),
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(vcbanlogChannelID);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] });
    }
}

module.exports = { VcBanCommand };
