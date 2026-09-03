const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class SayCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'say',
            description: 'Says things you tell the bot to say.',
            usage: '[channel] <text>',
            aliases: ['echo'],
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawChannel = await args.pickResult('guildTextChannel');
        const channel = rawChannel.isErr()
            ? message.channel
            : rawChannel.unwrap();

        if (
            !channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.ViewChannel) ||
            !channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.SendMessages)
        ) {
            return this.container.utility.errReply(
                message,
                'I do not have permission to view or send messages in that channel.'
            );
        }

        const text = await args.restResult('string');
        if (text.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide something for me to say.'
            );

        if (message.deletable) await message.delete();

        return channel.send({
            content: text.unwrap(),
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }

    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const channel =
            interaction.options.getChannel('channel') || interaction.channel;
        const text = interaction.options.getString('text');

        if (!channel) {
            return interaction.reply({
                content: 'Could not find the channel.',
                ephemeral: true,
            });
        }

        if (
            !channel
                .permissionsFor(interaction.guild.members.me)
                .has(PermissionFlagsBits.ViewChannel) ||
            !channel
                .permissionsFor(interaction.guild.members.me)
                .has(PermissionFlagsBits.SendMessages)
        ) {
            return interaction.reply({
                content:
                    'I do not have permission to view or send messages in that channel.',
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });

        await channel.send({
            content: text,
            allowedMentions: { users: [], roles: [], parse: [] },
        });

        return interaction.editReply('Message sent!');
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('Channel to send to (defaults to current)')
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('text')
                    .setDescription('Text to say')
                    .setRequired(true)
            );

        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { SayCommand };
