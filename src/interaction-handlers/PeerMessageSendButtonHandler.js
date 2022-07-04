const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const { ButtonInteraction, Modal, TextInputComponent, MessageActionRow } = require('discord.js');

class PeerMessageSendButtonHandler extends InteractionHandler {
	constructor(ctx) {
		super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button })
	}

	/**
	 * 
	 * @param { ButtonInteraction } interaction 
	 */
	async run(interaction) {
		const peerMsgSendModal = new Modal()
			.setCustomId('peer-submit')
			.setTitle('Message Send');
		
		const idInput = new TextInputComponent()
			.setCustomId('id')
			.setLabel("What's the id of the user you want to send a message to?")
			.setStyle('SHORT')
			.setRequired(true)
		
		const msgInput = new TextInputComponent()
			.setCustomId('msg')
			.setLabel("What's the message you want to send?")
			.setStyle('PARAGRAPH')
			.setRequired(true)
		
		const row1 = new MessageActionRow().addComponents(idInput)
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
		
		return this.some();
	}
}

 module.exports = { PeerMessageSendButtonHandler };