const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    EmbedBuilder,
    Colors,
    TextInputStyle,
    TextInputBuilder,
    ModalBuilder,
    ActionRowBuilder,
} = require('discord.js');

class GoldenmicappButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        console.log(interaction);
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

        const q1ActionRow = new ActionRowBuilder().addComponents(questionOne);
        const q2ActionRow = new ActionRowBuilder().addComponents(questionTwo);
        const q3ActionRow = new ActionRowBuilder().addComponents(questionThree);

        gmModal.addComponents(q1ActionRow, q2ActionRow, q3ActionRow);
        await interaction.showModal(gmModal);
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('goldenmic:')) return this.none();

        return this.some();
    }
}

module.exports = { GoldenmicappButtonHandler };
