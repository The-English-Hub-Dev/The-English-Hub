const { time, TimestampStyles } = require('@discordjs/builders');
const { Command, Args } = require('@sapphire/framework');
const { Message, EmbedBuilder, GuildMember, Colors } = require('discord.js');
const { logChannelID } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class WarnCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'warn',
            description: 'Warns/Strikes a user for breaking the rules.',
            usage: '<member> [reason]',
            preconditions: ['Staff'],
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        const rawReason = await args.restResult('string');

        if (rawReason.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a reason for the warn.'
            );
        const reason = rawReason.unwrap();

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to warn.'
            );
        }

        const member = rawMember.unwrap();

        if (
            message.member.roles.highest.position <=
            member.roles.highest.position
        ) {
            return this.container.utility.errReply(
                message,
                'You cannot warn members with equal or higher roles than you.'
            );
        }

        const punishment = new Punishment(
            message.author.id,
            member.id,
            reason,
            'warn',
            null
        );

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setDescription(
                    `${member.user} was warned with ID \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({
                embeds: [confirmEmbed],
            });
        }

        await this.sendMemberDM(message, member, reason, punishment);

        await this.logWarn(message, member, reason, punishment);
    }

    /**
     *
     * @param { Message } message
     * @param { GuildMember} member
     * @param { String} reason
     * @param { Punishment } punishment
     */
    async sendMemberDM(message, member, reason, punishment) {
        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle(`You were warned in ${message.guild.name}`)
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL(),
            })
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Punishment ID', value: punishment.punishment_id }
            )
            .setFooter({
                text: 'You may appeal this warn by opening a ticket in the Report Help channel',
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
     * @returns
     */
    async logWarn(message, member, reason, punishment) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle('Warn')
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
                    name: 'Expiration',
                    value: time(
                        Math.round(punishment.expiration / 1000),
                        TimestampStyles.LongDateTime
                    ),
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(logChannelID);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] }).catch();
    }
}

module.exports = { WarnCommand };
