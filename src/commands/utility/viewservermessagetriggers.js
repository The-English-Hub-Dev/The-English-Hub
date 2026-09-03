const { Command } = require('@sapphire/framework');
const { EmbedBuilder, Colors } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class ViewServerTriggersCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'viewservermessagetriggers',
            aliases: [
                'viewguildmessagetriggers',
                'viewguildtriggers',
                'viewtriggers',
                'triggers',
            ],
            description: 'View the message triggers in this server',
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        const guildTriggers = Object.entries(
            await this.container.redis.hgetall(
                `guildtriggers_${message.guild.id}`
            )
        );

        if (guildTriggers.length === 0) {
            return message.reply(
                'There are no message triggers set up in this server'
            );
        }

        const triggerListEmbed = new EmbedBuilder()
            .setTitle('Server Message Triggers')
            .setColor(Colors.LuminousVividPink)
            .setFooter({ text: `Message Triggers for ${message.guild.name}` })
            .setDescription(
                `**Trigger** → *Response*\n${guildTriggers
                    .map((tr) => `${tr[0]} → *${tr[1]}*`)
                    .join('\n')}`
            );

        return message.reply({ embeds: [triggerListEmbed] });
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const guildTriggers = Object.entries(
            await this.container.redis.hgetall(
                `guildtriggers_${interaction.guild.id}`
            )
        );
        if (guildTriggers.length === 0) {
            return interaction.reply(
                'There are no message triggers set up in this server'
            );
        }

        const triggerListEmbed = new EmbedBuilder()
            .setTitle('Server Message Triggers')
            .setColor(Colors.LuminousVividPink)
            .setFooter({ text: `Message Triggers for ${interaction.guild.name}` })
            .setDescription(
                `**Trigger** → *Response*\n${guildTriggers
                    .map((tr) => `${tr[0]} → *${tr[1]}*`)
                    .join('\n')}`
            );
        return interaction.reply({ embeds: [triggerListEmbed] });
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

module.exports = { ViewServerTriggersCommand };
