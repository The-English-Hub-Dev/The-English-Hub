const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    Modal,
    TextInputComponent,
    MessageActionRow,
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
        const isApprove = interaction.customId === 'peer-approve';
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (['peer-approve', 'peer-deny'].includes(interaction.customId))
            return this.none();

        return this.some();
    }
}

module.exports = { PeerMessageApproveButtonHandler };
