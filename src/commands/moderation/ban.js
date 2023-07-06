const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    time,
    TimestampStyles,
    Colors,
    EmbedBuilder,
} = require('discord.js');
const { logChannel } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class BanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ban',
            aliases: ['banish'],
            description: 'Bans a member from the server.',
            preconditions: ['Staff'],
            flags: ['noshow', 'noembed', 'hide'],
            usage: '<member> [reason] --deletedays=1',
            options: ['deletedays', 'del', 'days'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );
        const deleteDays =
            Number(args.getOption('deletedays', 'del', 'days')) ?? 1;

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid user to ban.'
            );
        }
        const member = rawMember.unwrap();

        if (member) {
            if (
                message.member.roles.highest.position <=
                member.roles.highest.position
            ) {
                return this.container.utility.error(
                    message,
                    'You cannot ban members with equal or higher roles than you.'
                );
            }
        }

        if (!member.bannable)
            return this.container.utility.error(
                message,
                'I do not have the permissions to ban that member.'
            );

        if (message.deletable) await message.delete();

        const punishment = new Punishment(
            message.author.id,
            member.user.id,
            reason,
            'ban'
        );

        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`You were banned from ${message.guild.name}`)
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL(),
            })
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Punishment ID', value: punishment.punishment_id },
                {
                    name: 'Appeal',
                    value: 'To appeal this ban, click [here](link not done yet).',
                }
            )
            .setFooter({
                text: 'If you believe this ban was unjustified, you may submit an appeal',
                iconURL: member.user.avatarURL(),
            })
            .setTimestamp();

        await member.send({ embeds: [dmEmbed] }).catch(() => {});

        await member.ban({ days: deleteDays, reason: reason });

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription(
                    `<:checkmark:990395449796087828> ${member.user} has been **banned** with ID \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({
                embeds: [confirmEmbed],
            });
        }

        const logEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Ban')
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
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(logChannel);
        return logCh.send({ embeds: [logEmbed] });
    }
}

module.exports = { BanCommand };
