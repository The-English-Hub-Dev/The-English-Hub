const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const { staffRoles } = require('../../config.json');

class GiveawayButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        const type = interaction.customId.split(':')[0].split('_')[1];
        const giveawayId = interaction.customId.split(':')[1];

        if (type == 'enter') {
            const alreadyJoinedGw = this.container.redis.lpos(
                `giveaway_${giveawayId}`,
                interaction.user.id
            );
            if (alreadyJoinedGw) {
                const alreadyJoinedAction =
                    new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                            .setCustomId(`gw_leave:${giveawayId}`)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel('Leave'),
                    ]);
                await interaction.editReply({
                    content:
                        'You have already joined this giveaway! Would you like to leave it?',
                    components: [alreadyJoinedAction],
                });
            }

            await this.container.redis.lpush(
                `giveaway_${giveawayId}`,
                interaction.user.id
            );

            this.updateEmbed(interaction, giveawayId);

            return interaction.editReply(`Successfully entered giveaway!`);
        } else {
            const alreadyJoinedGw = this.container.redis.lpos(
                `giveaway_${giveawayId}`,
                interaction.user.id
            );
            if (!alreadyJoinedGw)
                return interaction.editReply(
                    "You currently cannot use the leave button since you haven't entered the giveaway."
                );
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     * @param { string } giveawayId
     */
    async updateEmbed(interaction, giveawayId) {
        const oldEmbed = interaction.message.embeds[0];
        const currentEntrantsSize = (
            await this.container.redis.lrange(`giveaway_${giveawayId}`, 0, -1)
        ).length;

        const newEmbed = new EmbedBuilder()
            .setColor(oldEmbed.color)
            .setTitle(oldEmbed.title)
            .setDescription(
                `${oldEmbed.description.slice(0, oldEmbed.description.length - 1)}${currentEntrantsSize}`
            )
            .setFooter(oldEmbed.footer);
        return interaction.message.edit({ embeds: [newEmbed] });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('gw_')) return this.none();

        await interaction.deferReply({ ephemeral: true });
        return this.some();
    }
}

module.exports = { GiveawayButtonHandler };
