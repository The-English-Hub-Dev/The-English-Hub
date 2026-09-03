const { Command, Args } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const {
    Message,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActivityType,
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class SetstatusCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'setstatus',
            description: "Set's the bots status.",
            aliases: ['setactivity', 'sets', 'seta'],
            usage: '<type> <status>',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawType = await args.pickResult('enum', {
            enum: ['playing', 'watching', 'listening', 'competing'],
        });

        const type = rawType.unwrapOr('playing');
        const status = await args.restResult('string');

        if (status.isErr())
            return this.container.utility.errReply(
                message,
                'Please provide a status to set.'
            );

        const actTypes = {
            playing: ActivityType.Playing,
            watching: ActivityType.Watching,
            listening: ActivityType.Listening,
            competing: ActivityType.Competing,
        };

        if (this.container.intervals?.status) {
            clearInterval(this.container.intervals.status);
        }

        this.container.client.user.setActivity(status.unwrap(), {
            type: actTypes[type],
        });

        return message.reply(
            `Successfully set the bots status to ${type.toLowerCase()}: ${status.unwrap()}`
        );
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const type = interaction.options.getString('type') || 'playing';
        const status = interaction.options.getString('status');
        if (!status)
            return interaction.reply({
                content: 'Please provide a status to set.',
                ephemeral: true,
            });
        const actTypes = {
            playing: ActivityType.Playing,
            watching: ActivityType.Watching,
            listening: ActivityType.Listening,
            competing: ActivityType.Competing,
        };
        if (this.container.intervals?.status)
            clearInterval(this.container.intervals.status);
        this.container.client.user.setActivity(status, {
            type: actTypes[type] || ActivityType.Playing,
        });
        return interaction.reply(
            `Successfully set the bots status to ${type}: ${status}`
        );
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('Activity type')
                    .addChoices(
                        { name: 'Playing', value: 'playing' },
                        { name: 'Watching', value: 'watching' },
                        { name: 'Listening', value: 'listening' },
                        { name: 'Competing', value: 'competing' }
                    )
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('status')
                    .setDescription('Activity text')
                    .setRequired(true)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { SetstatusCommand };
