const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    MessageActionRow,
} = require('discord.js');

class PeerMessageSendButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        const peerMsgSendModal = new ModalBuilder()
            .setCustomId('peer-submit')
            .setTitle('Send a message to a member!');

        const idInput = new TextInputBuilder()
            .setCustomId('id')
            .setLabel('ID of member you want to send a message to')
            .setStyle('SHORT')
            .setRequired(true);

        const msgInput = new TextInputBuilder()
            .setCustomId('msg')
            .setLabel("What's the message you want to send?")
            .setStyle('PARAGRAPH')
            .setRequired(true);

        const row1 = new MessageActionRow().addComponents(idInput);
        const row2 = new MessageActionRow().addComponents(msgInput);

        peerMsgSendModal.addComponents(row1, row2);

        return interaction.showModal(peerMsgSendModal);
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (interaction.customId !== 'peer-request') return this.none();

        const peerMessageInqueue = await this.container.redis.hget(
            'peer-msg-inqueue',
            interaction.member.user.id
        );
        if (peerMessageInqueue) {
            return interaction.reply({
                content: `You currently have a peer message waiting to be approved or denied. Try again when it has been sent.`,
                ephemeral: true,
            });
        }

        return this.some();
    }
}

module.exports = { PeerMessageSendButtonHandler };
