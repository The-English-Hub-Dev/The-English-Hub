const { UserOrMemberMentionRegex } = require('@sapphire/discord-utilities');
const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    Modal,
    TextInputComponent,
    MessageActionRow,
    MessageEmbed,
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

        if (!isApprove) {
            interaction.update({
                content: 'This message was denied.',
                components: [],
            });

            const sendingMember = await interaction.guild.members.fetch(
                UserOrMemberMentionRegex.exec(
                    interaction.message.embeds[0].fields[0].value
                )[1]
            );
            const msg = interaction.message.embeds[0].description.slice(8);

            return sendingMember.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `Your message was not approved by the staff to be send to the requested member`
                        )
                        .setColor('RED')
                        .addField('Your message', msg),
                ],
            });
        } else {
            interaction.update({
                content: 'This message was approved.',
                components: [],
            });
            const sendingMember = await interaction.guild.members.fetch(
                UserOrMemberMentionRegex.exec(
                    interaction.message.embeds[0].fields[0].value
                )[1]
            );
            const recievingMember = await interaction.guild.members.fetch(
                UserOrMemberMentionRegex.exec(
                    interaction.message.embeds[0].fields[1].value
                )[1]
            );
            const msg = interaction.message.embeds[0].description.slice(8);

            const embed = new MessageEmbed()
                .setTitle(`New peer message`)
                .setDescription(
                    `Message from ${sendingMember} (${sendingMember.id}): ${msg}`
                )
                .setColor('GOLD')
                .setFooter({ text: `Message from ${interaction.guild}` });

            await recievingMember.send({
                content: `You have recieved a message from another member in ${interaction.guild}`,
                embeds: [embed],
            });

            return sendingMember.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `Your message was approved by a staff member and sent to the requested member`
                        )
                        .setColor('RED')
                        .addField('Your message', msg),
                ],
            });
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
