const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const { ModalSubmitInteraction } = require('discord.js');

class PeerMessageModalSubmitHandler extends InteractionHandler {
	constructor(ctx) {
		super(ctx, { interactionHandlerType: InteractionHandlerTypes.ModalSubmit })
	}

	/**
	 * 
	 * @param { ModalSubmitInteraction } interaction 
	 */
	async run(interaction) {
		const rawID = interaction.fields.getTextInputValue('id');

		const member = await interaction.guild.members.fetch(rawID).catch(() => null);
		if (!member) return interaction.reply({content: "You didn't provide a valid member id. See https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID- for information on how to get an ID.", ephemeral: true})

		await interaction.reply({content: 'Your message was recieved. It will now be removed and then sent to the member.', ephemeral: true});

		
	}

	/**
	 * 
	 * @param { ModalSubmitInteraction } interaction 
	 */
	async parse(interaction) {
		if (interaction.customId !== 'peer-submit') return this.none();
		
		return this.some();
	}
}

 module.exports = { PeerMessageModalSubmitHandler };