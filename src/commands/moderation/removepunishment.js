const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    time,
    TimestampStyles,
} = require('discord.js');

class RemovepunishmentCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'removepunishment',
            aliases: [
                'rmpunish',
                'rmwarn',
                'delpunishment',
                'delwarn',
                'removestrike',
            ],
            description: 'Removes the punishment with the specified ID.',
            preconditions: ['Staff'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const punishmentID = await args.pickResult('string');
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );

        const punishment = await this.container.db.punishments.findOneBy({
            punishment_id: punishmentID,
        });

        if (!punishment) {
            return message.reply(
                '<:xmark:981278932672335883> A punishment with that ID does not exist.'
            );
        }

        const confirmationEmbed = new EmbedBuilder()
            .setTitle('Are you sure?')
            .setDescription(
                `Please confirm you would like to remove punishment \`${punishmentID}\`. Once confirmed, this action is **irreversible**.`
            )
            .setColor(Colors.Red);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle('SUCCESS'),

            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle('DANGER')
        );

        await message.reply({ embeds: [confirmationEmbed], components: [row] });

        const filter = (interaction) => {
            if (interaction.user.id === message.author.id) return true;
            return interaction.reply({
                content: 'This embed is not for you.',
                ephemeral: true,
            });
        };

        const collector = message.channel.createMessageComponentCollector({
            filter,
            max: 2,
        });

        collector.on('collect', async (ButtonInteraction) => {
            this.container.logger.debug('button clicked');
            const id = ButtonInteraction.customId;

            if (id === 'confirm') {
                await this.container.database.punishments.delete({
                    punishment_id: punishmentID,
                });

                const confirmedEmbed = new EmbedBuilder()
                    .setTitle('Confirmed')
                    .setDescription(
                        `<:checkmark:990395449796087828> Punishment \`${punishmentID}\` has been removed.`
                    )
                    .setColor('#63ff78');

                ButtonInteraction.update({
                    embeds: [confirmedEmbed],
                    components: [],
                });

                const punishedUser = await this.container.client.users.fetch(
                    punishment.user_id
                );
                const moderator = await this.container.client.users.fetch(
                    punishment.moderator_id
                );
                const logEmbed = new EmbedBuilder()
                    .setColor('#4284ff')
                    .setTitle('Punishment Removed')
                    .setAuthor({
                        name: punishedUser.tag,
                        iconURL: punishedUser.avatarURL(),
                    })
                    .addField(
                        'Punishment ID',
                        `\`${punishment.punishment_id}\``
                    )
                    .addField(
                        'User',
                        `${punishedUser.tag} [${punishedUser.id}]`
                    )
                    .addField(
                        'Punishment moderator',
                        `${moderator} [${moderator.id}]`
                    )
                    .addField(
                        'Removal moderator',
                        `${message.author.tag} [${message.author.id}]`
                    )
                    .addField('Punishment reason', punishment.reason)
                    .addField('Removal reason', reason)
                    .addField(
                        'Punishment Date',
                        time(punishment.timestamp, TimestampStyles.LongDateTime)
                    )
                    .addField(
                        'Removal Date',
                        time(new Date(), TimestampStyles.LongDateTime)
                    )
                    .setFooter({
                        text: 'Moderation Logs',
                        iconURL: message.guild.iconURL(),
                    })
                    .setThumbnail(this.container.client.user.avatarURL());

                const logChannel =
                    message.guild.channels.cache.get('980979428614103060');
                await logChannel.send({ embeds: [logEmbed] });
                return collector.stop();
            } else if (id === 'cancel') {
                const cancelledEmbed = new EmbedBuilder()
                    .setTitle('Cancelled')
                    .setDescription(`No punishments were affected.`)
                    .setColor('#000000');

                await ButtonInteraction.update({
                    embeds: [cancelledEmbed],
                    components: [],
                });

                return collector.stop();
            }
        });
    }
}

module.exports = { RemovepunishmentCommand };
