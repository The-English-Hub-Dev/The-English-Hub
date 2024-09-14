const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    GuildMember,
    time,
    TimestampStyles,
    Colors,
} = require('discord.js');
const { logChannelID, mutedRoleID } = require('../../../config.json');
const { Duration } = require('@sapphire/time-utilities');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class MuteCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'mute',
            aliases: ['timeout', 'silence', 'mu'],
            description: 'Mutes a member in the server.',
            usage: '<member> <duration> [reason] -t',
            preconditions: ['NotOrigCmdChannel', 'Staff'],
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        const rawDuration = await args.pickResult('string');
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason given.'
        );

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to mute.'
            );
        }
        const member = rawMember.unwrap();

        if (rawDuration.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid duration to mute.'
            );
        }
        const duration = rawDuration.unwrap();

        if (
            message.member.roles.highest.position <=
            member.roles.highest.position
        ) {
            return this.container.utility.errReply(
                message,
                'You cannot mute members with equal or higher roles than you.'
            );
        }

        if (!member.manageable)
            return this.container.utility.errReply(
                message,
                'I cannot manage this member and therefore cannot mute them.'
            );

        const rawTime = new Duration(duration);

        if (isNaN(rawTime.offset)) {
            return this.container.utility.errReply(
                message,
                'Invalid duration specified for mute.'
            );
        }
        const timeInMs = rawTime.offset;

        if (!mutedRoleID)
            return this.container.utility.errReply(
                message,
                'The muted role is not configured.'
            );

        if (member.roles.cache.has(mutedRoleID)) {
            return this.container.utility.errReply(
                message,
                'This member is already muted.'
            );
        }

        await member.roles.add(
            mutedRoleID,
            `Mute command executed by ${message.author.tag}`
        );

        const expiry = Math.round((Date.now() + timeInMs) / 1000);
        await this.container.redis.hset(
            'muted',
            `${member.id}:${Date.now()}`,
            expiry
        );

        const punishment = new Punishment(
            message.author.id,
            member.id,
            reason,
            'mute',
            expiry
        );

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.Orange)
                .setDescription(
                    `<:Hellos:1218430823229820968> ${member.user} was muted with ID \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({
                embeds: [confirmEmbed],
            });
        }

        await this.sendMemberDM(message, member, reason, punishment, expiry);

        await this.logMute(message, member, reason, punishment, expiry);
    }

    /**
     *
     * @param { Message } message
     * @param { GuildMember } member
     * @param { String } reason
     * @param { Punishment } punishment
     */
    async sendMemberDM(message, member, reason, punishment, expiry) {
        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`You were muted in ${message.guild.name}`)
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL(),
            })
            .addFields(
                {
                    name: 'Expires',
                    value: time(expiry, TimestampStyles.LongDateTime),
                },
                { name: 'Reason', value: reason },
                { name: 'Punishment ID', value: punishment.punishment_id }
            )
            .setFooter({
                text: 'You may appeal this mute by opening a ticket or sending a message in the muted channel',
                iconURL: member.user.avatarURL(),
            })
            .setTimestamp(Date.now());

        await member.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    /**
     *
     * @param { Message } message
     * @param { GuildMember } member
     * @param { String } reason
     * @param { Punishment } punishment
     * @param { number } expiry
     * @returns
     */
    async logMute(message, member, reason, punishment, expiry) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle('Mute')
            .setAuthor({
                name: member.user.tag,
                iconURL: member.user.avatarURL(),
            })
            .addFields(
                {
                    name: 'Punishment ID',
                    value: `\`${punishment.punishment_id}\``,
                },
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
                    value: time(expiry, TimestampStyles.LongDateTime),
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(logChannelID);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] });
    }
}

module.exports = { MuteCommand };
