const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    time,
    TimestampStyles,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

class RoleRemoveCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'roleremove',
            aliases: ['removerole'],
            description: 'Removes a role from a member.',
            preconditions: ['ManageRolesPerms'],
            usage: '<member> <role> [reason]',
            flags: ['noshow', 'noembed', 'hide'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        const rawRole = await args.pickResult('role');
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid member.'
            );
        }
        const member = rawMember.unwrap();

        if (rawRole.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid role.'
            );
        }
        const role = rawRole.unwrap();

        if (message.member.roles.highest.position <= role.position) {
            return this.container.utility.errReply(
                message,
                'You cannot manage a role that is higher or equal to your highest role.'
            );
        }

        if (message.guild.members.me.roles.highest.position <= role.position) {
            return this.container.utility.errReply(
                message,
                'I cannot manage a role that is higher or equal to my highest role.'
            );
        }

        if (!member.roles.cache.has(role.id)) {
            return this.container.utility.errReply(
                message,
                'The member does not have that role.'
            );
        }

        if (message.deletable) await message.delete();

        await member.roles.remove(role, reason);

        if (!args.getFlags('noshow', 'noembed', 'hide')) {
            const confirmEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(
                    `<:Hellos:1218430823229820968> Removed ${role} from ${member.user}.`
                );

            await message.channel.send({ embeds: [confirmEmbed] });
        }

        await this.logRoleRemove(message, member, role, reason);
    }

    async logRoleRemove(message, member, role, reason) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Role Removed')
            .setAuthor({
                name: member.user.tag,
                iconURL: member.user.avatarURL(),
            })
            .addFields(
                {
                    name: 'User',
                    value: `${member.user.tag} (${member.user.id})`,
                },
                { name: 'Role', value: `${role} (${role.id})` },
                {
                    name: 'Moderator',
                    value: `${message.author.tag} (${message.author.id})`,
                },
                { name: 'Reason', value: reason },
                {
                    name: 'Date',
                    value: time(new Date(), TimestampStyles.LongDateTime),
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(logChannelID);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] });
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const member = interaction.options.getMember('member');
        return interaction.reply({
            content: 'TODO: Implement',
            ephemeral: true,
        });
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) =>
                option
                    .setName('member')
                    .setDescription('Target')
                    .setRequired(true)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { RoleRemoveCommand };
