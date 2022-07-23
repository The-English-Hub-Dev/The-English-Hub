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

        const fieldZero = interaction.message.embeds[0].fields[0].value;
        const fieldOne = interaction.message.embeds[0].fields[1].value;
        const sendingMember = await interaction.guild.members.fetch(
            fieldZero.slice(fieldZero.indexOf('(') + 1, fieldZero.length - 1)
        );
        const recievingMember = await interaction.guild.members.fetch(
            fieldOne.slice(fieldOne.indexOf('(') + 1, fieldOne.length - 1)
        );

        if (!isApprove) {
            interaction.update({
                content: 'This message was denied.',
                components: [],
            });

            const msg = interaction.message.embeds[0].description.slice(8);

            return sendingMember.send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `Your message was **not approved** by the staff to be sent to the requested member.`
                        )
                        .setColor('RED')
                        .addField('Your message', msg, true)
                        .addField(
                            'Recieving Member',
                            `${recievingMember} (${recievingMember.user.tag})`,
                            true
                        ),
                ],
            });
        } else {
            interaction.update({
                content: 'This message was approved.',
                components: [],
            });

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
                            `Your message was **approved** by a staff member and sent to the requested member.`
                        )
                        .setColor('GREEN')
                        .addField('Your message', msg, true)
                        .addField(
                            'Recieving member',
                            `${recievingMember} (${recievingMember.user.tag})`,
                            true
                        ),
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
