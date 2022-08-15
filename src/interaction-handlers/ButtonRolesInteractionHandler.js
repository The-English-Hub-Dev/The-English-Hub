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
                return this.updateRole(
                    interaction,
                    member,
                    continentRoles,
                    category
                );
            case 'englishlevel':
                return this.updateRole(
                    interaction,
                    member,
                    englishLevelRoles,
                    category
                );
            case 'englishdialect':
                return this.updateRole(
                    interaction,
                    member,
                    englishDialectRoles,
                    category
                );
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
                return this.updateRole(
                    interaction,
                    member,
                    notificationRoles,
                    category
                );
            default:
                return interaction.followUp(
                    'An error occured. Please try again.'
                );
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     * @param { GuildMember } member
     * @param { Role | Role[] } role
     * @param { String } key
     */
    async updateRole(interaction, member, role, key) {
        const continentRoles = [...continentRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );
        const englishLevelRoles = [...englishLevelRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );
        const englishDialectRoles = [...englishDialectRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );
        const notificationRoles = [...notificationRoleIDs].map((id) =>
            interaction.guild.roles.cache.get(id)
        );
        if (key === 'n/a') {
            let isAddna;
            if (member.roles.cache.has(role.id)) {
                await member.roles.add(role, 'Reaction Role add');
                isAddna = true;
            } else {
                await member.roles.remove(role, 'Reaction Role remove');
                isAddna = false;
            }

            const updateEmbedna = new MessageEmbed()
                .setDescription(
                    `Successfully ${isAddna ? 'added' : 'removed'} ${role}.`
                )
                .setColor(isAddna ? 'GREEN' : 'RED');

            return interaction.followUp({ embeds: [updateEmbedna] });
        } else {
            let roleArray;
            switch (key) {
                case 'continent':
                    roleArray = continentRoles;
                    break;
                case 'englishlevel':
                    roleArray = englishLevelRoles;
                    break;
                case 'englishdialect':
                    roleArray = englishDialectRoles;
                    break;
                case 'notification':
                    roleArray = notificationRoles;
                    break;
                default:
                    break;
            }

            const name = interaction.customId.split('-')[2];
            let isAdd;
            const r = continentRoles.find((r) => r.name.toLowerCase() === name);
            if (!r)
                return interaction.followUp(
                    'An error occured while finding the role to add/remove. Please try again.'
                );

            if (member.roles.cache.has(r.id)) {
                await member.roles.remove(r, 'Reaction Role remove');
                isAdd = false;
            } else {
                for (const role of roleArray) {
                    await member.roles.remove(role, 'Removing all other roles');
                }
                await member.roles.add(r, 'Reaction Role add');
                isAdd = true;
            }

            const updateEmbed = new MessageEmbed()
                .setDescription(
                    `Successfully ${isAdd ? 'added' : 'removed'} ${role}.${
                        isAdd ? 'Removed all other roles in the category.' : ''
                    }`
                )
                .setColor(isAdd ? 'GREEN' : 'RED');

            return interaction.followUp({ embeds: [updateEmbed] });
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('role')) return this.none();

        interaction.deferReply({ ephemeral: true });
        return this.some(interaction.member);
    }
}

module.exports = { PeerMessageSendButtonHandler };
