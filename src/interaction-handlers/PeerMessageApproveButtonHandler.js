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

		if (!isApprove) {
			interaction.update({content: 'This message was denied.', components: []});

			const rawMember = interaction.message.embeds[0].fields[1];
			const sendingMember = await interaction.guild.members.fetch(UserOrMemberMentionRegex.exec(rawMember.value)[0]);
			
			sendingMember.send(`Your message was not approved by the staff to be send to the requested member`); // TODO: improve reply
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
