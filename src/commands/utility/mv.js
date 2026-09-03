const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} = require('discord.js');
const { mvChannelsAllowed } = require('../../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

class MvCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'mv',
            aliases: [
                'moveme',
                'movevc',
                'movemevc',
                'bypassrest',
                'bypassjoin',
            ],
            preconditions: ['MoveMe'],
            usage: ['<channel type:VoiceChannel>'],
            description: 'Moves you into a certain voice channel.',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const vc = await args.pickResult('guildVoiceChannel');
        if (vc.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid voice channel to be moved into.'
            );

        if (!message.member.voice.channel)
            return this.container.utility.errReply(
                message,
                'You must be in a voice channel to use this command otherwise I cannot move you to a new channel.'
            );

        if (!mvChannelsAllowed.includes(vc.unwrap().parent.id)) {
            return this.container.utility.errReply(
                message,
                'This cateogyr is not in the allowed list for being moved into. Please ask a server admin for help.'
            );
        }
        if (
            !message.member
                .permissionsIn(vc.unwrap())
                .has(PermissionFlagsBits.ViewChannel)
        )
            return this.container.utility.errReply(
                message,
                "You are not allowed to move yourself to that channel as it isn't visible to you."
            );
        try {
            await message.member.voice.setChannel(
                vc.unwrap(),
                `${message.member.user.tag} requested to be moved with the moveme command.`
            );
        } catch (error) {
            return message.reply(
                `I could not move you to that channel. Error: ${error}`
            );
        }

        return message.reply(
            `You have been successfully moved to ${vc.unwrap()}`
        );
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel) return interaction.reply({ content: 'You must provide a valid voice channel.', ephemeral: true });
        if (!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
        if (!mvChannelsAllowed.includes(channel.parent.id)) return interaction.reply({ content: 'That channel is not in the allowed list.', ephemeral: true });
        if (!interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ViewChannel)) return interaction.reply({ content: 'You are not allowed to move to that channel.', ephemeral: true });
        try { await interaction.member.voice.setChannel(channel, `${interaction.user.tag} requested to be moved.`); } catch (error) { return interaction.reply(`I could not move you to that channel. Error: ${error}`); }
        return interaction.reply(`You have been successfully moved to ${channel}`);
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption((option) => option.setName('channel').setDescription('Voice channel').setRequired(true));
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { MvCommand };
