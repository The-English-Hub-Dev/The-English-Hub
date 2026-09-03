const { Command, Args } = require('@sapphire/framework');
const {
    EmbedBuilder,
    Message,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class SendVcEmbedCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'sendvcselectembed',
            aliases: [
                'sendvcembed',
                'sendvc',
                'sendactivevc',
                'sendvcbuttonembed',
            ],
            description: 'Sends the embed for the vc select feature',
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const vcSelectEmbed = new EmbedBuilder()
            .setTitle('Join a trending voice channel')
            .setDescription(
                'Join a random or a currently trending voice channel in this server!'
            )
            .setColor('LuminousVividPink')
            .setFooter({
                text: `${message.guild.name}`,
                iconURL: message.guild.iconURL(),
            });
        const vcSelectButtonActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId('vcselect:largest')
                .setLabel('Join the largest active VC')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('vcselect:random')
                .setLabel('Join a random VC')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('vcselect:popular')
                .setLabel('Join a popular VC')
                .setStyle(ButtonStyle.Secondary),
        ]);

        return message.channel.send({
            embeds: [vcSelectEmbed],
            components: [vcSelectButtonActionRow],
        });
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const embed = new EmbedBuilder().setTitle('Join a trending voice channel').setDescription('Join a random or a currently trending voice channel in this server!').setColor('LuminousVividPink').setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
        const row = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId('vcselect:largest').setLabel('Join the largest active VC').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('vcselect:random').setLabel('Join a random VC').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('vcselect:popular').setLabel('Join a popular VC').setStyle(ButtonStyle.Secondary),
        ]);
        return interaction.reply({ embeds: [embed], components: [row] });
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { SendVcEmbedCommand };
