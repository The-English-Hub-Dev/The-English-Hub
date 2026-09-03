const { Command, Args } = require('@sapphire/framework');
const {
    EmbedBuilder,
    Message,
    Colors,
    ChatInputCommandInteraction,
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class AvatarCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'avatar',
            aliases: ['av'],
            usage: '[user]',
            preconditions: [['Staff', 'PremiumMember']],
            description: 'Shows the avatar of a user.',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const rawUser = await args.pickResult('user');

        const user = rawUser.unwrapOr(message.author);

        const av = user.displayAvatarURL({ size: 4096 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}'s Avatar`)
            .setImage(av)
            .setColor(Colors.Blurple)
            .setTimestamp()
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(),
            });

        return message.reply({ embeds: [embed] });
    }

    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const av = user.displayAvatarURL({ size: 4096 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}'s Avatar`)
            .setImage(av)
            .setColor(Colors.Blurple)
            .setTimestamp()
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

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
                    .setName('user')
                    .setDescription('The user to get the avatar for')
                    .setRequired(false)
            );

        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { AvatarCommand };
