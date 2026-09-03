const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    time,
    TimestampStyles,
    PermissionFlagsBits,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;
const { SlashCommandBuilder } = require('@discordjs/builders');

class LockdownCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'lockdown',
            aliases: ['lock'],
            description:
                'Locks down a channel, preventing users from sending messages.',
            preconditions: ['ManageChannelsPerms'],
            usage: '[channel] [reason]',
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const channel = (await args.pickResult('guildTextChannel')).unwrapOr(
            message.channel
        );
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );

        const everyonePerms = channel.permissionOverwrites.cache.get(
            message.guild.id
        );
        if (
            everyonePerms &&
            everyonePerms.deny.has(PermissionFlagsBits.SendMessages)
        ) {
            return this.container.utility.errReply(
                message,
                'This channel is already locked.'
            );
        }

        if (message.deletable) await message.delete();

        await channel.permissionOverwrites.edit(
            message.guild.id,
            {
                SendMessages: false,
            },
            { reason: reason }
        );

        const punishment = await Punishment.create(
            message.author.id,
            channel.id,
            reason,
            'lockdown'
        );

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.DarkRed)
                .setDescription(
                    `<:Hellos:1218430823229820968> ${channel} has been locked. ID \`${punishment.punishment_id}\`.`
                );

            await message.channel.send({ embeds: [confirmEmbed] });
        }

        await this.logLockdown(message, channel, reason, punishment);
    }

    async logLockdown(message, channel, reason, punishment) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle('Channel Lockdown')
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.avatarURL(),
            })
            .addFields(
                {
                    name: 'Punishment ID',
                    value: `\`${punishment.punishment_id}\``,
                },
                { name: 'Channel', value: `${channel} (${channel.id})` },
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
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        if (channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id)?.deny.has('SendMessages')) return interaction.reply({ content: 'That channel is already locked down.', ephemeral: true });
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason });
        const punishment = await Punishment.create(interaction.user.id, channel.id, reason, 'lockdown');
        return interaction.reply(`<:Hellos:1218430823229820968> Locked down ${channel} with ID \`${punishment.punishment_id}\`.`);
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption((option) => option.setName('channel').setDescription('Channel').setRequired(false))
            .addStringOption((option) => option.setName('reason').setDescription('Reason').setRequired(false));
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { LockdownCommand };
