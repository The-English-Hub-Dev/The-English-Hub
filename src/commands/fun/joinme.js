const { Command, Args } = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');

class JoinMeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'joinme',
            description: 'Does something very cool in vc.',
            aliases: ['jm'],
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     */
    async messageRun(message) {
        const channel = message.member.voice.channel;
        if (!channel)
            return this.container.utility.errReply(
                message,
                'You must be a in a VC for the bot to join you.'
            );

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        return message.reply('Joined you in VC!');
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
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
            .setDescription(this.description);
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { JoinMeCommand };
