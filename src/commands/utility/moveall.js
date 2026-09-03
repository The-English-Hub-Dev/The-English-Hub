const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    ChatInputCommandInteraction,
    ChatInputCommandInteraction,
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class MoveAllCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'moveall',
            aliases: ['mvall', 'moveallvc'],
            preconditions: ['Staff'],
            usage: ['<channel type:VoiceChannel> <channel type:VoiceChannel>'],
            description:
                'Moves all members in a voice channel to another voice channel.',
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
                'You must provide a valid voice channel to be move everyone from.'
            );

        const vcMove = await args.pickResult('guildVoiceChannel');
        if (vcMove.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid voice channel to be move everyone to.'
            );

        const vcMembers = [...vc.unwrap().members.map((member) => member)];

        const chunkSize = 5;
        for (let i = 0; i < vcMembers.length; i += chunkSize) {
            const chunk = vcMembers.slice(i, i + chunkSize);
            await Promise.allSettled(
                chunk.map((member) => member.voice.setChannel(vcMove.unwrap()))
            );
        }

        return message.reply(
            `Moved ${vcMembers.length} members from ${vc.unwrap()} to ${vcMove.unwrap()}.`
        );
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

module.exports = { MoveAllCommand };
