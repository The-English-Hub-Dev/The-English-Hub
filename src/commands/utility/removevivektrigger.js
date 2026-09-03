const { Command, Args } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');
class RemoveVivekTriggerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'removevivektrigger',
            aliases: ['removevivekhighlight'],
            description: "Removes a word from vivek's highlight triggers",
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
        const trigger = await args.restResult('string');
        if (trigger.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a word to remove to the highlight triggers'
            );
        }

        await this.container.redis.lrem(
            'hltriggers_vivek',
            1,
            trigger.unwrap()
        );

        return message.reply(
            `Successfully removed \`${trigger.unwrap()}\` from the highlight triggers for Vivek`
        );
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const trigger = interaction.options.getString('trigger');
        if (!trigger) {
            return interaction.reply({
                content:
                    'You must provide a word to remove to the highlight triggers',
                ephemeral: true,
            });
        }

        await this.container.redis.lrem('hltriggers_vivek', 1, trigger);
        return interaction.reply(
            `Successfully removed \`${trigger}\` from the highlight triggers for Vivek`
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
                    .setName('trigger')
                    .setDescription('Word')
                    .setRequired(true)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { RemoveVivekTriggerCommand };
