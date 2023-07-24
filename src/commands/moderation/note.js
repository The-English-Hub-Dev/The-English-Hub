const { time, TimestampStyles } = require('@discordjs/builders');
const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    GuildMember,
    Colors,
    ChannelType,
} = require('discord.js');
const { logChannel } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;

class NoteCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'note',
            description: "Adds a note to a user's profile.",
            preconditions: ['Staff'],
            usage: '<member> [note to add]',
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        message.channel.permissionOverwrites;

        const rawMember = await args.pickResult('member');
        const reason = await args.restResult('string');

        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a reason for the note.'
            );

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to note on their profile.'
            );
        }

        const member = rawMember.unwrap();

        if (
            message.member.roles.highest.position <=
            member.roles.highest.position
        ) {
            return this.container.utility.errReply(
                message,
                'You cannot take a note for members with equal or higher roles than you.'
            );
        }

        const punishment = new Punishment(
            message.author.id,
            member.id,
            reason,
            'note',
            null
        );

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.Grey)
                .setDescription(
                    `${member.user} had a note added to their profile. \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({
                embeds: [confirmEmbed],
            });
        }

        await this.logNote(message, member, reason, punishment);
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
            .setColor(Colors.Grey)
            .setTitle(`You were given a note in ${message.guild.name}`)
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
    async logNote(message, member, reason, punishment) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.Aqua)
            .setTitle('Note added')
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

        const logCh = message.guild.channels.cache.get(logChannel);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] }).catch();
    }
}

module.exports = { NoteCommand };
