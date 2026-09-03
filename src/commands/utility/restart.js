const { Command } = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class RestartCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'restart',
            description: 'Restarts the bot',
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        const cooldownActive =
            await this.container.redis.get('restart-cooldown');

        if (cooldownActive) {
            const ttl = await this.container.redis.ttl('restart-cooldown');
            return message.reply(
                `⏳ Please wait ${ttl} seconds before restarting the bot again. This prevents the hosting service from not restarting the bot due to too frequent crashes.`
            );
        }

        await this.container.redis.setex('restart-cooldown', 60, '1');

        await this.container.redis.hset(
            'tasks',
            'restart',
            `${message.channel.id}:${Date.now()}`
        );

        await message.reply('Restarting bot...');

        process.exit(0);
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const cooldownActive = await this.container.redis.get('restart-cooldown');
        if (cooldownActive) return interaction.reply(`Please wait ${await this.container.redis.ttl('restart-cooldown')} seconds before restarting the bot again.`);
        await this.container.redis.setex('restart-cooldown', 60, '1');
        await this.container.redis.hset('tasks', 'restart', `${interaction.channel.id}:${Date.now()}`);
        await interaction.reply('Restarting bot...');
        process.exit(0);
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

module.exports = { RestartCommand };
