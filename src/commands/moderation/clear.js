const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    time,
    TimestampStyles,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');
const Punishment =
    require('../../library/db/entities/PunishmentEntity').Punishment;
const { SlashCommandBuilder } = require('@discordjs/builders');

class ClearCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'clear',
            aliases: ['purge'],
            description:
                'Clears a specified number of messages from a channel.',
            preconditions: ['ManageMessagesPerms'],
            usage: '<amount> [reason]',
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const amountRaw = await args.pickResult('number');
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );

        if (amountRaw.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid number of messages to clear.'
            );
        }

        const amount = amountRaw.unwrap();

        if (amount < 1 || amount > 100) {
            return this.container.utility.errReply(
                message,
                'You can only clear between 1 and 100 messages at a time.'
            );
        }

        if (message.deletable) await message.delete();

        const deleted = await message.channel.bulkDelete(amount, true);

        const punishment = await Punishment.create(
            message.author.id,
            message.channel.id,
            reason,
            'clear'
        );

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(
                    `<:Hellos:1218430823229820968> Cleared ${deleted.size} messages with ID \`${punishment.punishment_id}\`.`
                );

            const msg = await message.channel.send({ embeds: [confirmEmbed] });
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        }

        await this.logClear(message, deleted.size, reason, punishment);
    }

    async logClear(message, amount, reason, punishment) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle('Clear')
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.avatarURL(),
            })
            .addFields(
                {
                    name: 'Punishment ID',
                    value: `\`${punishment.punishment_id}\``,
                },
                {
                    name: 'Channel',
                    value: `${message.channel} (${message.channel.id})`,
                },
                {
                    name: 'Moderator',
                    value: `${message.author.tag} (${message.author.id})`,
                },
                { name: 'Messages Cleared', value: `${amount}` },
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
        const amount = interaction.options.getInteger('amount');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        if (!amount || amount < 1 || amount > 100) return interaction.reply({ content: 'You can only clear between 1 and 100 messages at a time.', ephemeral: true });
        const deleted = await interaction.channel.bulkDelete(amount, true);
        const punishment = await Punishment.create(interaction.user.id, interaction.channel.id, reason, 'clear');
        const confirmEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`<:Hellos:1218430823229820968> Cleared ${deleted.size} messages with ID \`${punishment.punishment_id}\`.`);
        return interaction.reply({ embeds: [confirmEmbed] });
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption((option) => option.setName('amount').setDescription('Messages').setMinValue(1).setMaxValue(100).setRequired(true))
            .addStringOption((option) => option.setName('reason').setDescription('Reason').setRequired(false));
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { ClearCommand };
