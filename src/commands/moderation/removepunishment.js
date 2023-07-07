const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    time,
    TimestampStyles,
    ButtonStyle,
    PermissionFlagsBits,
} = require('discord.js');
const { logChannel } = require('../../../config.json');

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
            usage: '<punishment ID> [reason]',
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
            'No reason provided for punishment removal.'
        );

        if (punishmentID.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a punishment ID to remove.'
            );

        const punishment = await this.container.db.punishments.findOneBy({
            punishment_id: punishmentID.unwrap(),
        });

        if (!punishment) {
            return message.reply('A punishment with that ID does not exist.');
        }

        if (
            punishment.moderator_id !== message.author.id &&
            !message.member.permissions.has(PermissionFlagsBits.Administrator)
        )
            return message.reply(
                'You cannot remove a punishment that you did not give. You need to ask an admin to remove it.'
            );

        const confirmationEmbed = new EmbedBuilder()
            .setTitle('Are you sure?')
            .setDescription(
                `Please confirm you would like to remove punishment \`${punishmentID.unwrap()}\`. Once confirmed, you cannot revert this action.`
            )
            .setColor(Colors.Red);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rmpunish_confirm')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('rmpunish_cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
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
            const id = ButtonInteraction.customId;

            if (id === 'rmpunish_confirm') {
                await this.container.db.punishments.delete({
                    punishment_id: punishmentID,
                });

                const confirmedEmbed = new EmbedBuilder()
                    .setTitle('Confirmed')
                    .setDescription(
                        `Punishment \`${punishmentID}\` was removed.`
                    )
                    .setColor(Colors.DarkRed);

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
                    .setColor(Colors.DarkVividPink)
                    .setTitle('Punishment Removed')
                    .setAuthor({
                        name: punishedUser.tag,
                        iconURL: punishedUser.avatarURL(),
                    })
                    .addFields(
                        {
                            name: 'Punishment ID',
                            value: `\`${punishment.punishment_id}\``,
                        },
                        {
                            name: 'User',
                            value: `${punishedUser.tag} (${punishedUser.id})`,
                        },
                        {
                            name: 'Punishment Moderator',
                            value: `${moderator} (${moderator.id})`,
                        },
                        {
                            name: 'Action Moderator',
                            value: `${message.author.tag} (${message.author.id})`,
                        },
                        { name: 'Punishment Reason', value: punishment.reason },
                        { name: 'Removal Reason', value: reason },
                        {
                            name: 'Punishment Date',
                            value: time(
                                punishment.timestamp,
                                TimestampStyles.LongDateTime
                            ),
                        },
                        {
                            name: 'Removal Date',
                            value: time(
                                new Date(),
                                TimestampStyles.LongDateTime
                            ),
                        }
                    )
                    .setFooter({
                        text: 'Moderation Logs',
                        iconURL: message.guild.iconURL(),
                    })
                    .setThumbnail(this.container.client.user.avatarURL());

                const logChannelFetched =
                    message.guild.channels.cache.get(logChannel);
                await logChannelFetched.send({ embeds: [logEmbed] });
                return collector.stop();
            } else if (id === 'rmpunish_cancel') {
                const cancelledEmbed = new EmbedBuilder()
                    .setTitle('Cancelled')
                    .setDescription(`No punishments were affected.`)
                    .setColor(Colors.Green);

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
