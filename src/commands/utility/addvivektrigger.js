const { Command, Args } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');

class AddVivekTriggerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'addvivektrigger',
            aliases: ['addvivekhighlight'],
            description:
                "Adds a word to vivek's highlight triggers that will send vivek a dm when mentioned",
            usage: '<trigger>',
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
                'You must provide a word to add to the highlight triggers'
            );
        }

        await this.container.redis.lpush('hltriggers_vivek', trigger.unwrap());

        return message.reply(
            `Successfully added \`${trigger.unwrap()}\` to the highlight triggers for Vivek`
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
                    'You must provide a word to add to the highlight triggers',
                ephemeral: true,
            });
        }

        await this.container.redis.lpush('hltriggers_vivek', trigger);
        return interaction.reply(
            `Successfully added \`${trigger}\` to the highlight triggers for Vivek`
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

module.exports = { AddVivekTriggerCommand };
