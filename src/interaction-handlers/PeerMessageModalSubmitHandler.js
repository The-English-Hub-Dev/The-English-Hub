const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ModalSubmitInteraction,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} = require('discord.js');
const { peerMsgReviewChannelID } = require('../../config.json');

class PeerMessageModalSubmitHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, {
            interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
        });
    }

    /**
     *
     * @param { ModalSubmitInteraction } interaction
     */
    async run(interaction) {
        const rawID = interaction.fields.getTextInputValue('id');
        const msg = interaction.fields.getTextInputValue('msg');

        const member = await interaction.guild.members
            .fetch(rawID)
            .catch(() => null);
        if (!member)
            return interaction.reply({
                content:
                    "You didn't provide a valid member ID. See https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID- for information on how to get an ID.",
                ephemeral: true,
            });

        if (member.id === interaction.member.id)
            return interaction.reply({
                content: "You can't send a message to yourself :(",
                ephemeral: true,
            });
        if (member.user.bot)
            return interaction.reply({
                content: "You can't send a message to a bot :(",
                ephemeral: true,
            });

        const ch = interaction.guild.channels.cache.get(peerMsgReviewChannelID);
        if (!ch || ch.type !== 'GUILD_TEXT')
            return interaction.reply({
                content: 'An error occured. Please try again.',
                ephemeral: true,
            });

        const embed = new MessageEmbed()
            .setTitle(
                `${interaction.user.tag} wants to send ${member.user.tag} a message!`
            )
            .setColor('BLURPLE')
            .setDescription(`Message: ${msg}`)
            .addField(
                'Sending member',
                `${interaction.member} (${interaction.member.id})`,
                true
            )
            .addField('Recieving member', `${member} (${member.id})`, true);

        const buttons = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel('Approve Peer Message')
                .setCustomId('peer-approve')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setLabel('Deny Peer Message')
                .setCustomId('peer-deny')
                .setStyle('DANGER')
        );

        await ch
            .send({
                content: 'New Peer Message for review',
                embeds: [embed],
                components: [buttons],
            })
            .catch(() => {
                return interaction.reply({
                    content:
                        'An error occured while sending your message for review. Please try again.',
                    ephemeral: true,
                });
            });

        await this.container.redis.hset(
            'peer-msg-inqueue',
            interaction.member.user.id,
            'yes'
        );

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        'Your message was recieved. It will now be reviewed and then sent to the member if it is approved. You will recieve a DM when it is approved or denied.'
                    )
                    .setColor('GREEN'),
            ],
            ephemeral: true,
        });
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
