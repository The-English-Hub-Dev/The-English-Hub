const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    EmbedBuilder,
    Colors,
    ChannelType,
    PermissionFlagsBits,
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
            (ch) =>
                ch.type === ChannelType.GuildVoice &&
                ch
                    .permissionsFor(interaction.member)
                    .has(PermissionFlagsBits.Connect) &&
                ch
                    .permissionsFor(interaction.member)
                    .has(PermissionFlagsBits.ViewChannel)
        );
        switch (type) {
            case 'largest': {
                await interaction.editReply('Finding largest VC...');
                const largestVc = allVcs
                    .sort((a, b) => b.members.size - a.members.size)
                    .first();
                await interaction.editReply(
                    `Largest VC with ${largestVc.members.size} members: ${largestVc} (click to join)`
                );
                break;
            }
            case 'random': {
                const randomVc = allVcs.random();
                await interaction.editReply(
                    `Random VC : ${randomVc} (click to join)`
                );
                break;
            }
            case 'popular': {
                await interaction.editReply('Finding popular VC...');
                const popularVc = allVcs
                    .filter((vc) => vc.members.size >= 5)
                    .random();
                await interaction.editReply(
                    `Popular VC: ${popularVc} (click to join)`
                );
                break;
            }
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
