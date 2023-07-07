const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    GuildMember,
    time,
    TimestampStyles,
} = require('discord.js');
const { logChannel } = require('../../../config.json');
const { Duration } = require('@sapphire/time-utilities');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class MuteCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'mute',
            aliases: ['timeout', 'silence'],
            description: 'Mutes a member in the server.',
            preconditions: ['Staff'],
            flags: ['timeout', 'rolemute', 'role', 'noshow', 'noembed', 'hide'],
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

        const rawType = args.getFlags('timeout', 'rolemute', 'role');
        if (!rawType)
            return this.container.utility.errReply(
                message,
                'You must provide whether to mute using roles or timeouts using the `-role`, `-rolemute`, or `-timeout` flags'
            );

        if (
            args.getFlags('timeout') &&
            (args.getFlags('rolemute') || args.getFlags('role'))
        ) {
            return this.container.utility.errReply(
                message,
                'You cannot mute using both timeouts and roles.'
            );
        }

        const type = args.getFlags('timeout') ? 'timeout' : 'role';

        const rawTime = new Duration(duration);

        if (isNaN(rawTime.offset)) {
            return this.container.utility.errReply(
                message,
                'Invalid duration specified for mute.'
            );
        }
        const timeInMs = rawTime.offset;

        if (type === 'timeout') {
            if (member.communicationDisabledUntil)
                return this.container.utility.errReply(
                    message,
                    'This member is already muted (using timeouts).'
                );
            await member.timeout(timeInMs, reason);
        } else {
            // TODO
            return message.reply(
                'This feature is not yet implemented. You can currently only mute using the timeout feature.'
            );
        }

        const expiry = Math.round(
            (punishment.timestamp.getTime() + timeInMs) / 1000
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
                .setColor('#f8ff91')
                .setDescription(
                    `${member.user} was muted with ID \`${punishment.punishment_id}\`.`
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
            .setColor('#f8ff91')
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
                text: 'You may appeal this mute by opening a ticket',
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
            .setColor('#f8ff91')
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

        const logCh = message.guild.channels.cache.get(logChannel);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] });
    }
}

module.exports = { MuteCommand };
