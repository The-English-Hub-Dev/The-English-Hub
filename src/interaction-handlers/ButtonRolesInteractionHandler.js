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
            case 'english classes':
                return this.updateRole(
                    interaction,
                    member,
                    englishClassesRole,
                    'n/a'
                );
            case 'correct me':
                return this.updateRole(
                    interaction,
                    member,
                    correctMeRole,
                    'n/a'
                );
            case 'debate club':
                return this.updateRole(
                    interaction,
                    member,
                    debateClubRole,
                    'n/a'
                );
            case 'wotd':
                return this.updateRole(interaction, member, wotdRole, 'n/a');
            case 'book club':
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
                    '**An error occured:** This button role exists but is not linked to a role.'
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
                try {
                    await member.roles.remove(role, 'Reaction Role remove');
                } catch (error) {
                    return interaction.followUp(
                        `**An error occured:** ${error}`
                    );
                }
                isAddna = false;
            } else {
                try {
                    await member.roles.add(role, 'Reaction Role add');
                } catch (error) {
                    return interaction.followUp(
                        `**An error occured:** ${error}`
                    );
                }
                isAddna = true;
            }

            const updateEmbedna = new MessageEmbed()
                .setDescription(`${isAddna ? 'Added' : 'Removed'} ${role}.`)
                .setColor(isAddna ? 'DARK_GREEN' : 'DARK_RED');

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
            const r = roleArray.find((r) => r.name.toLowerCase() === name);
            if (!r)
                return interaction.followUp(
                    'An error occured while finding the role to add/remove. Please try again.'
                );

            if (member.roles.cache.has(r.id)) {
                try {
                    await member.roles.remove(r, 'Reaction Role remove');
                } catch (error) {
                    return interaction.followUp(
                        `**An error occured:** ${error}`
                    );
                }
                isAdd = false;
            } else {
                if (key !== 'notification') {
                    for (const role of roleArray) {
                        try {
                            await member.roles.remove(
                                role,
                                'Removing all other roles'
                            );
                        } catch (error) {
                            return interaction.followUp(
                                `**An error occured:** ${error}`
                            );
                        }
                    }
                }

                try {
                    await member.roles.add(r, 'Reaction Role add');
                } catch (error) {
                    return interaction.followUp(
                        `**An error occured:** ${error}`
                    );
                }

                isAdd = true;
            }

            const updateEmbed = new MessageEmbed()
                .setDescription(
                    `${isAdd ? 'Added' : 'Removed'} ${r}. ${
                        isAdd && key !== 'notification'
                            ? 'Removed all other roles in the category.'
                            : ''
                    }`
                )
                .setColor(isAdd ? 'DARK_GREEN' : 'DARK_RED');

            return interaction.followUp({ embeds: [updateEmbed] });
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('role')) return this.none();

        await interaction.deferReply({ ephemeral: true });
        return this.some(interaction.member);
    }
}

module.exports = { PeerMessageSendButtonHandler };
