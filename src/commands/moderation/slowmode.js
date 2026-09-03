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
const { SlashCommandBuilder } = require('@discordjs/builders');

class SlowmodeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'slowmode',
            aliases: ['sm'],
            description: 'Sets the slowmode for a channel.',
            preconditions: ['ManageChannelsPerms'],
            usage: '<duration> [channel] [reason]',
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawDuration = await args.pickResult('string');
        const channel = (await args.pickResult('guildTextChannel')).unwrapOr(
            message.channel
        );
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );

        if (rawDuration.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid duration for slowmode (e.g. 5s, 0s to disable).'
            );
        }

        const durationStr = rawDuration.unwrap();
        const rawTime = new Duration(durationStr);

        if (isNaN(rawTime.offset)) {
            return this.container.utility.errReply(
                message,
                'Invalid duration specified.'
            );
        }

        const timeInSeconds = Math.round(rawTime.offset / 1000);

        if (timeInSeconds > 21600) {
            return this.container.utility.errReply(
                message,
                'Slowmode cannot exceed 6 hours (21600 seconds).'
            );
        }

        if (timeInSeconds < 0) {
            return this.container.utility.errReply(
                message,
                'Slowmode duration cannot be negative.'
            );
        }

        if (message.deletable) await message.delete();

        await channel.setRateLimitPerUser(timeInSeconds, reason);

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(
                    `<:Hellos:1218430823229820968> Slowmode for ${channel} set to **${timeInSeconds} seconds**.`
                );

            const msg = await message.channel.send({ embeds: [confirmEmbed] });
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        }

        await this.logSlowmode(message, channel, timeInSeconds, reason);
    }

    async logSlowmode(message, channel, timeInSeconds, reason) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle('Slowmode Changed')
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.avatarURL(),
            })
            .addFields(
                { name: 'Channel', value: `${channel} (${channel.id})` },
                {
                    name: 'Moderator',
                    value: `${message.author.tag} (${message.author.id})`,
                },
                { name: 'Duration', value: `${timeInSeconds} seconds` },
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
        const duration = interaction.options.getInteger('duration');
        const channel =
            interaction.options.getChannel('channel') || interaction.channel;
        const reason =
            interaction.options.getString('reason') || 'No reason provided.';
        if (duration == null || duration < 0 || duration > 21600)
            return interaction.reply({
                content: 'Slowmode must be between 0 and 21600 seconds.',
                ephemeral: true,
            });
        await channel.setRateLimitPerUser(duration, reason);
        return interaction.reply(
            `Slowmode for ${channel} set to **${duration} seconds**.`
        );
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
            .addIntegerOption((option) =>
                option
                    .setName('duration')
                    .setDescription('Seconds')
                    .setMinValue(0)
                    .setMaxValue(21600)
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Text channel')
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('reason')
                    .setDescription('Reason')
                    .setRequired(false)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { SlowmodeCommand };
