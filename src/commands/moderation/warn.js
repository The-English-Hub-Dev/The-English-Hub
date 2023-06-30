const { time, TimestampStyles } = require('@discordjs/builders');
const { Command, Args } = require('@sapphire/framework');
const { Message, EmbedBuilder, GuildMember } = require('discord.js');
const { logChannel } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class WarnCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'warn',
            description: 'Warns/Strikes a user for breaking the rules.',
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
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason given.'
        );

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
                .setColor('#73af96')
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
            .setColor('#73af96')
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

        await member.send({ embeds: [dmEmbed] }).catch();
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
            .setColor('#73af96')
            .setTitle('Warn')
            .setAuthor({
                name: member.user.tag,
                iconURL: member.user.avatarURL(),
            })
            .addField('Punishment ID', `\`${punishment.punishment_id}\``)
            .addField('User', `${member.user.tag} [${member.user.id}]`)
            .addField(
                'Moderator',
                `${message.author.tag} [${message.author.id}]`
            )
            .addField('Reason', reason)
            .addField('Date', time(new Date(), TimestampStyles.LongDateTime))
            .addField(
                'Expiration',
                time(
                    Math.round(punishment.expiration / 1000),
                    TimestampStyles.LongDateTime
                )
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(logChannel);
        return logCh.send({ embeds: [logEmbed] }).catch();
    }
}

module.exports = { WarnCommand };
