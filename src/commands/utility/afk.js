const { Command, Args } = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class AFKCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'afk',
            description: 'Set your AFK status to be tracked by the bot.',
            preconditions: ['Staff'],
            aliases: ['away', 'bye', 'busy'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const rawReason = await args.restResult('string');

        const reason = rawReason.unwrapOr('No reason provided.');

        await this.container.redis.hset(
            'afk',
            message.author.id,
            `${Date.now()}:${reason}`
        );

        return message.reply({
            content: `You are AFK: ${reason}`,
            allowedMentions: { users: [], roles: [], repliedUser: false },
        });
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

module.exports = { AFKCommand };
