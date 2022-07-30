const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    GuildMember,
    Role,
    MessageEmbed,
    Message,
} = require('discord.js');
const {
    continentRoleIDs,
    englishLevelRoleIDs,
    englishDialectRoleIDs,
    englishClassesRoleID,
    correctMeRoleID,
    debateClubRoleID,
    wotdRoleID,
    bookClubRoleID,
    notificationRoleIDs,
} = require('../../config.json');

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
        const category = interaction.customId.split('-')[1];
        const continentRoles = [...continentRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );
        const englishLevelRoles = [...englishLevelRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );
        const englishDialectRoles = [...englishDialectRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );
        const englishClassesRole =
            interaction.guild.roles.cache.get(englishClassesRoleID);
        const correctMeRole =
            interaction.guild.roles.cache.get(correctMeRoleID);
        const debateClubRole =
            interaction.guild.roles.cache.get(debateClubRoleID);
        const wotdRole = interaction.guild.roles.cache.get(wotdRoleID);
        const bookClubRole = interaction.guild.roles.cache.get(bookClubRoleID);
        const notificationRoles = [...notificationRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );

        switch (category) {
            case 'continent':
                return this.updateRole(int)
                break;
            case 'englishlevel':
                break;
            case 'englishdialect':
                break;
            case 'englishclasses':
                return this.updateRole(
                    interaction,
                    member,
                    englishClassesRole,
                    'n/a'
                );
            case 'correctme':
                return this.updateRole(
                    interaction,
                    member,
                    correctMeRole,
                    'n/a'
                );
            case 'debateclub':
                return this.updateRole(
                    interaction,
                    member,
                    debateClubRole,
                    'n/a'
                );
            case 'wotd':
                return this.updateRole(interaction, member, wotdRole, 'n/a');
            case 'bookclub':
                return this.updateRole(
                    interaction,
                    member,
                    bookClubRole,
                    'n/a'
                );
            case 'notification':
                break;
            default:
                break;
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     * @param { GuildMember } member
     * @param { Role } role
     * @param { String } key
     */
    async updateRole(interaction, member, role, key) {
        if (key === 'n/a') {
            let isAdd;
            if (member.roles.cache.has(role.id)) {
                await member.roles.add(role);
                isAdd = true;
            } else {
                await member.roles.remove(role);
                isAdd = false;
            }

            const updateEmbed = new MessageEmbed()
                .setDescription(
                    `Successfully ${isAdd ? 'added' : 'removed'} ${role}.`
                )
                .setColor(isAdd ? 'GREEN' : 'RED');

            return interaction.followUp({ embeds: [updateEmbed] });
        }
        else {
            
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
