const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    time,
    TimestampStyles,
    Colors,
    EmbedBuilder,
    GuildMember,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;
const { SlashCommandBuilder } = require('@discordjs/builders');

class BanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ban',
            aliases: ['banish'],
            description: 'Bans a member from the server.',
            preconditions: ['StaffBanPerms'],
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
        const deleteDays = Number(
            args.getOption('deletedays', 'del', 'days') ?? 1
        );

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
                return this.container.utility.errReply(
                    message,
                    'You may not ban members with equal or higher roles than you.'
                );
            }
        }

        if (!member.bannable)
            return this.container.utility.errReply(
                message,
                'That member is unbannable.'
            );

        if (message.deletable) await message.delete();

        const punishment = await Punishment.create(
            message.author.id,
            member.user.id,
            reason,
            'ban'
        );

        await this.sendMemberDM(message, member, reason, punishment);

        await member.ban({ days: deleteDays, reason: reason });

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.DarkRed)
                .setDescription(
                    `<:Hellos:1218430823229820968> ${member.user} has been **banned** with ID \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({
                embeds: [confirmEmbed],
            });
        }

        await this.logBan(message, member, reason, punishment);
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

    /**
     *
     * @param { Message } message
     * @param { GuildMember } member
     * @param { String } reason
     * @param { Punishment } punishment
     * @returns
     */
    async logBan(message, member, reason, punishment) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
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

        const logCh = message.guild.channels.cache.get(logChannelID);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] });
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const member = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const deleteDays = interaction.options.getNumber('deletedays') || 1;

        if (!member) {
            return interaction.reply({
                content: 'You must provide a valid user to ban.',
                ephemeral: true,
            });
        }

        if (
            interaction.member.roles.highest.position <=
            member.roles.highest.position
        ) {
            return interaction.reply({
                content:
                    'You may not ban members with equal or higher roles than you.',
                ephemeral: true,
            });
        }

        if (!member.bannable)
            return interaction.reply({
                content: 'That member is unbannable.',
                ephemeral: true,
            });

        const punishment = await Punishment.create(
            interaction.user.id,
            member.user.id,
            reason,
            'ban'
        );

        await this.sendMemberDMInteraction(interaction, member, reason, punishment);

        await member.ban({ days: deleteDays, reason: reason });

        const confirmEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setDescription(
                `<:Hellos:1218430823229820968> ${member.user} has been **banned** with ID \`${punishment.punishment_id}\`.`
            );

        await interaction.reply({
            embeds: [confirmEmbed],
        });

        await this.logBanInteraction(interaction, member, reason, punishment);
    }

    /**
     *
     * @param { ChatInputCommandInteraction } interaction
     * @param { GuildMember} member
     * @param { String} reason
     * @param { Punishment } punishment
     */
    async sendMemberDMInteraction(interaction, member, reason, punishment) {
        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`You were banned from ${interaction.guild.name}`)
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL(),
            })
            .addFields(
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

    /**
     *
     * @param { ChatInputCommandInteraction } interaction
     * @param { GuildMember } member
     * @param { String } reason
     * @param { Punishment } punishment
     * @returns
     */
    async logBanInteraction(interaction, member, reason, punishment) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
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
                    value: `${interaction.user.tag} (${interaction.user.id})`,
                },
                { name: 'Reason', value: reason },
                {
                    name: 'Date',
                    value: time(new Date(), TimestampStyles.LongDateTime),
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: interaction.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = interaction.guild.channels.cache.get(logChannelID);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] });
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName('member')
                    .setDescription('Target')
                    .setRequired(true)
            )
            .addStringOption((option) => option.setName('reason').setDescription('Reason').setRequired(false))
            .addIntegerOption((option) => option.setName('deletedays').setDescription('Days of messages to delete').setMinValue(0).setMaxValue(7).setRequired(false));
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { BanCommand };
