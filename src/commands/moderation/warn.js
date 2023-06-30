const { time, TimestampStyles } = require('@discordjs/builders');
const { Command, Args } = require('@sapphire/framework');
const { Message, EmbedBuilder } = require('discord.js');
const { logChannel } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class WarnCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'warn',
            aliases: ['w', 'strike'],
            description: 'Warns a user for breaking the rules.',
            preconditions: ['StaffMember'],
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        const reason =
            (await args.restResult('string')).value ?? 'No reason given.';

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
                    `${member.user} has been warned with ID \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({
                embeds: [confirmEmbed],
            });
        }

        const dmEmbed = new EmbedBuilder()
            .setColor('#73af96')
            .setTitle(`You were warned in ${message.guild.name}`)
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL(),
            })
            .addField('Reason', reason)
            .addField('Punishment ID', punishment.punishment_id)
            .setFooter({
                text: 'You may appeal this warn by opening a ticket in the Report Help channel',
                iconURL: member.user.avatarURL(),
            })
            .setTimestamp(Date.now());

        await member.send({ embeds: [dmEmbed] }).catch();

        await this.logWarn(message, member, reason, punishment);
    }

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
        return logCh.send({ embeds: [logEmbed] });
    }
}

module.exports = { WarnCommand };
