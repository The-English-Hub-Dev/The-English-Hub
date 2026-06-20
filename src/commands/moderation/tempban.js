const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    time,
    TimestampStyles,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');
const { Duration } = require('@sapphire/time-utilities');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class TempbanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'tempban',
            aliases: ['tban'],
            description: 'Temporarily bans a member from the server.',
            preconditions: ['StaffBanPerms'],
            usage: '<member> <duration> [reason] --deletedays=1',
            options: ['deletedays', 'del', 'days'],
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
            'No reason provided.'
        );
        const deleteDays = Number(
            args.getOption('deletedays', 'del', 'days') ?? 1
        );

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to tempban.'
            );
        }
        const member = rawMember.unwrap();

        if (rawDuration.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid duration.'
            );
        }
        const duration = rawDuration.unwrap();

        if (member) {
            if (
                message.member.roles.highest.position <=
                member.roles.highest.position
            ) {
                return this.container.utility.errReply(
                    message,
                    'You may not ban members with equal or higher roles than you.'
                );
            }
        }

        if (!member.bannable) {
            return this.container.utility.errReply(
                message,
                'That member is unbannable.'
            );
        }

        const rawTime = new Duration(duration);

        if (isNaN(rawTime.offset)) {
            return this.container.utility.errReply(
                message,
                'Invalid duration specified.'
            );
        }
        const timeInMs = rawTime.offset;
        const expiry = Math.round((Date.now() + timeInMs) / 1000);

        if (message.deletable) await message.delete();

        const punishment = await Punishment.create(
            message.author.id,
            member.user.id,
            reason,
            'tempban',
            expiry
        );

        await this.sendMemberDM(message, member, reason, punishment, expiry);

        await member.ban({ days: deleteDays, reason: reason });

        await this.container.redis.hset(
            'banned',
            `${member.user.id}:${Date.now()}`,
            expiry
        );

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.DarkRed)
                .setDescription(
                    `<:Hellos:1218430823229820968> ${member.user} has been **temporarily banned** with ID \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({ embeds: [confirmEmbed] });
        }

        await this.logTempban(message, member, reason, punishment, expiry);
    }

    async sendMemberDM(message, member, reason, punishment, expiry) {
        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`You were temporarily banned from ${message.guild.name}`)
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
                { name: 'Punishment ID', value: punishment.punishment_id },
                {
                    name: 'Appeal',
                    value: 'To appeal this ban, click [here](https://discord.com/invite/Yp26QSPnRT).',
                }
            )
            .setFooter({
                text: 'If you believe this ban was unjustified, you may submit an appeal',
                iconURL: member.user.avatarURL(),
            })
            .setTimestamp();

        return member.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    async logTempban(message, member, reason, punishment, expiry) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle('Tempban')
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
module.exports = { TempbanCommand };
