const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const { ButtonInteraction, EmbedBuilder, Colors } = require('discord.js');
const { staffRoles } = require('../../config.json');

class QueueButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        const command = interaction.customId.split('_')[0].split(':')[1];
        const queueId = interaction.customId.split('_')[1];

        const alreadyJoined = await this.container.redis.lpos(
            `queue_${queueId}`,
            interaction.user.id
        );

        switch (command) {
            case 'join':
                if (alreadyJoined !== null)
                    return interaction.editReply({
                        content: 'You have already joined this queue!',
                        ephemeral: true,
                    });
                await this.container.redis.lpush(
                    `queue_${queueId}`,
                    interaction.user.id
                );
                await this.updateEmbed(interaction, queueId);

                return interaction.editReply({
                    content:
                        'You have successfully joined this queue! Use the `Leave` button if you would like to leave.',
                    ephemeral: true,
                });
            case 'leave':
                if (alreadyJoined === null) {
                    return interaction.editReply({
                        content:
                            'You have not joined this queue! Use the `Join` button if you would like to join.',
                        ephemeral: true,
                    });
                }
                await this.container.redis.lrem(
                    `queue_${queueId}`,
                    1,
                    interaction.user.id
                );
                await this.updateEmbed(interaction, queueId);

                return interaction.editReply({
                    content:
                        'You have successfully left this queue! Use the `Join` button if you would like to join again.',
                    ephemeral: true,
                });
            case 'clear':
                if (
                    !staffRoles.some((role) =>
                        interaction.member.roles.cache.has(role)
                    )
                ) {
                    return interaction.editReply({
                        content:
                            'You do not have permission to clear this queue!',
                        ephemeral: true,
                    });
                }
                await this.container.redis.del(`queue_${queueId}`);
                await this.updateEmbed(interaction, queueId);

                return interaction.editReply({
                    content: 'You have successfully cleared this queue!',
                    ephemeral: true,
                });
            default:
                break;
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     * @param { string } queueId
     */
    async updateEmbed(interaction, queueId) {
        const oldEmbed = interaction.message.embeds[0];
        const currentQueueUsersIDs = await this.container.redis.lrange(
            `queue_${queueId}`,
            0,
            -1
        );
        const currentQueueUsers = currentQueueUsersIDs
            .map(
                (id, index) =>
                    `${currentQueueUsersIDs.length - index}: <@${id}>`
            )
            .reverse()
            .join('\n');

        const newEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(oldEmbed.title)
            .setDescription(
                `Queue ID: ${queueId}\n\n**Users:**\n ${
                    currentQueueUsers.length > 0 ? currentQueueUsers : 'None'
                }`
            )
            .setFooter(oldEmbed.footer);
        return interaction.message.edit({ embeds: [newEmbed] });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('queue:')) return this.none();

        await interaction.deferReply({ ephemeral: true });
        return this.some();
    }
}

module.exports = { QueueButtonHandler };
