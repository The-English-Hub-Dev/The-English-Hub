const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} = require('discord.js');

class PeerMessageApproveButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        const isApprove = interaction.customId.split('-')[1] == 'approve';

        await interaction.message.fetch();

        const fieldZero = interaction.message.embeds[0].fields[0].value;
        const fieldOne = interaction.message.embeds[0].fields[1].value;
        const sendingMember = await interaction.guild.members.fetch(
            fieldZero.slice(fieldZero.indexOf('(') + 1, fieldZero.length - 1)
        );
        const recievingMember = await interaction.guild.members.fetch(
            fieldOne.slice(fieldOne.indexOf('(') + 1, fieldOne.length - 1)
        );
        const msg = interaction.message.embeds[0].description.slice(8);
        if (!msg.length)
            return interaction.channel.send(
                'I was not able to fetch the message for this interaction, please try again. Contact the developer if this error continues.'
            );

        // allow the user to send another peer message
        await this.container.redis.hdel('peer-msg-inqueue', sendingMember.id);

        if (!isApprove) {
            await interaction.update({
                content: 'This message was denied.',
                components: [],
                embeds: [interaction.message.embeds[0].setColor('RED')],
            });

            await sendingMember
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `Your message was **not approved** by the staff to be sent to the requested member.`
                            )
                            .setColor('RED')
                            .addFields(
                                {
                                    name: 'Your message',
                                    value: msg,
                                    inline: true,
                                },
                                {
                                    name: 'Recieving member',
                                    value: `${recievingMember} (${recievingMember.user.tag})`,
                                    inline: true,
                                }
                            ),
                    ],
                })
                .catch(
                    async () =>
                        await interaction.message.edit({
                            content:
                                'This message was denied. **However, the dms of the person who sent the message were closed so I could not deliver the message to them.**',
                        })
                );
        } else {
            interaction.update({
                content: 'This message was approved.',
                components: [],
                embeds: [interaction.message.embeds[0].setColor('GREEN')],
            });

            const embed = new EmbedBuilder()
                .setTitle(`New peer message`)
                .setDescription(
                    `Message from ${sendingMember} (${sendingMember.id}): ${msg}`
                )
                .setColor('GOLD')
                .setFooter({
                    text: `Message from ${interaction.guild}`,
                    iconURL: sendingMember.avatarURL(),
                });

            try {
                await recievingMember.send({
                    content: `You have recieved a message from another member in ${interaction.guild}`,
                    embeds: [embed],
                });
                return sendingMember
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `Your message was **approved** by a staff member and sent to the requested member. You can now send another peer message using the system.`
                                )
                                .setColor('GREEN')
                                .addFields(
                                    {
                                        name: 'Your message',
                                        value: msg,
                                        inline: true,
                                    },
                                    {
                                        name: 'Recieving member',
                                        value: `${recievingMember} (${recievingMember.user.tag})`,
                                        inline: true,
                                    }
                                ),
                        ],
                    })
                    .catch(
                        async () =>
                            await interaction.message.edit({
                                content: `${interaction.message.content} *However, the dms of the person who sent the message were closed so I could not tell them the status of their message.*`,
                            })
                    );
            } catch (error) {
                // DMs were closed
                await interaction.message.edit({
                    content: `${interaction.message.content} **This peer message was not sent because of the recieving member's dms being closed. The sender has been notified**.`,
                });
                return sendingMember
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `Your message was **approved** by a staff member but was not able to be sent to the requested member. The dms of the member were closed. You may try to send another peer message when the user's dms are open.`
                                )
                                .setColor('GREEN')
                                .addFields(
                                    {
                                        name: 'Your message',
                                        value: msg,
                                        inline: true,
                                    },
                                    {
                                        name: 'Recieving member',
                                        value: `${recievingMember} (${recievingMember.user.tag})`,
                                        inline: true,
                                    }
                                ),
                        ],
                    })
                    .catch(
                        async () =>
                            await interaction.message.edit({
                                content:
                                    "This message was approved. **This peer message was not sent because of the recieving member's dms being closed. The sender has not been notified since their dms are closed**.",
                            })
                    );
            }
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!['peer-approve', 'peer-deny'].includes(interaction.customId))
            return this.none();

        return this.some();
    }
}

module.exports = { PeerMessageApproveButtonHandler };
