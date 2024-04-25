const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    EmbedBuilder,
    Colors,
    ChannelType,
} = require('discord.js');

class VcSelectButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction, type) {
        const allVcs = interaction.guild.channels.cache.filter(
            (ch) => ch.type === ChannelType.GuildVoice
        );
        switch (type) {
            case 'largest':
                const largestVc = allVcs
                    .sort((a, b) => b.members.size - a.members.size)
                    .first();
                await interaction.editReply(
                    `Largest VC with ${largestVc.members.size} members: https://discord.gg/${(await largestVc.createInvite()).code}`
                );
                break;
            case 'random':
                const randomVc = allVcs.random();
                await interaction.editReply(
                    `Random VC : https://discord.gg/${(await randomVc.createInvite()).code}`
                );
                break;
            case 'popular':
                const popularVc = allVcs
                    .filter((vc) => vc.members.size >= 5)
                    .random();
                await interaction.editReply(
                    `Popular VC: https://discord.gg/${(await popularVc.createInvite()).code}`
                );
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
        if (!interaction.customId.startsWith('vcselect:')) return this.none();

        await interaction.deferReply({ ephemeral: true });
        return this.some(interaction.customId.split(':')[1]);
    }
}

module.exports = { VcSelectButtonHandler };
