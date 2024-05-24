const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const { ButtonInteraction, EmbedBuilder, Colors } = require('discord.js');
const { eventManagerRoles, staffRoles } = require('../../config.json');

class GoldenmicappButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        if (interaction.customId.split(':')[1] == 'modal_request') {
            const gmModal = new ModalBuilder()
                .setCustomId('goldenmic:modal_submit')
                .setTitle('Golden Microphone Application');

            const questionOne = new TextInputBuilder()
                .setCustomId('questionOne')
                .setLabel(
                    "How long you've been a part of this server? How often are you active in the voice channels?"
                )
                .setStyle(TextInputStyle.Paragraph);

            const questionTwo = new TextInputBuilder()
                .setCustomId('questionTwo')
                .setLabel('Do you have any past infractions?')
                .setStyle(TextInputStyle.Short);

            const questionThree = new TextInputBuilder()
                .setCustomId('questionThree')
                .setLabel(
                    'With what reason are you making this request? (Make sure your answer is a good one. One word replies wont go in your favour)'
                )
                .setStyle(TextInputStyle.Paragraph);

            const q1ActionRow = new ActionRowBuilder().addComponent(
                questionOne
            );
            const q2ActionRow = new ActionRowBuilder().addComponent(
                questionTwo
            );
            const q3ActionRow = new ActionRowBuilder().addComponent(
                questionThree
            );

            gmModal.addComponents(q1ActionRow, q2ActionRow, q3ActionRow);
            await interaction.showModal(gmModal);
        } else {
            // modal_submit
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('goldenmic:')) return this.none();

        await interaction.deferReply({ ephemeral: true });
        return this.some();
    }
}

module.exports = { GoldenmicappButtonHandler };
