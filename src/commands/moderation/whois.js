const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    time,
    TimestampStyles,
    Colors,
    EmbedBuilder,
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class WhoisCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'whois',
            aliases: ['userinfo', 'user'],
            description: 'Shows information about a user.',
            usage: '[member]',
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const user = (await args.pickResult('user')).unwrapOr(message.author);
        const member = message.guild?.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor(member?.displayColor || Colors.Blue)
            .setAuthor({
                name: user.tag,
                iconURL: user.avatarURL(),
            })
            .setThumbnail(user.avatarURL({ size: 256 }))
            .addFields(
                { name: 'ID', value: user.id },
                {
                    name: 'Account Created',
                    value: time(user.createdAt, TimestampStyles.RelativeTime),
                    inline: true,
                },
                {
                    name: 'Bot',
                    value: user.bot ? 'Yes' : 'No',
                    inline: true,
                }
            );

        if (member) {
            const roles = member.roles.cache
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString())
                .slice(0, -1);

            embed.addFields(
                {
                    name: 'Joined Server',
                    value: time(member.joinedAt, TimestampStyles.RelativeTime),
                    inline: true,
                },
                {
                    name: `Roles [${roles.length}]`,
                    value: roles.join(', ') || 'None',
                },
                {
                    name: 'Nickname',
                    value: member.nickname || 'None',
                    inline: true,
                }
            );
        }

        embed
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.avatarURL(),
            })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const user = interaction.options.getUser('member') || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);
        const embed = new EmbedBuilder()
            .setColor(member?.displayColor || Colors.Blue)
            .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
            .setThumbnail(user.avatarURL({ size: 256 }))
            .addFields(
                { name: 'ID', value: user.id },
                {
                    name: 'Account Created',
                    value: time(user.createdAt, TimestampStyles.RelativeTime),
                    inline: true,
                },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true }
            );
        if (member) {
            const roles = member.roles.cache
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString())
                .slice(0, -1);
            embed.addFields(
                {
                    name: 'Joined Server',
                    value: time(member.joinedAt, TimestampStyles.RelativeTime),
                    inline: true,
                },
                {
                    name: `Roles [${roles.length}]`,
                    value: roles.join(', ') || 'None',
                },
                {
                    name: 'Nickname',
                    value: member.nickname || 'None',
                    inline: true,
                }
            );
        }
        embed
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL(),
            })
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
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
                    .setRequired(false)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { WhoisCommand };
