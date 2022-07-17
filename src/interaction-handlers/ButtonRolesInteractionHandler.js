const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const { ButtonInteraction, GuildMember } = require('discord.js');

class PeerMessageSendButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     * @param { GuildMember } member
     */
    async run(interaction, member) {
        switch (interaction.customId.split('-')[1]) {
            case value:
                break;

            default:
                break;
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('role')) return this.none();

        return this.some(interaction.member);
    }
}

module.exports = { PeerMessageSendButtonHandler };
