const { Command, Args } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');

class RemoveVivekTriggerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'removeservermessagetrigger',
            aliases: [
                'removemessagetrigger',
                'removetrigger',
                'removeservertrigger',
            ],
            description:
                "removes a trigger and the corresponding response from the server's message triggers",
            preconditions: ['Admin'],
            usage: `<trigger>`,
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
        if (trigger.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid trigger to remove.'
            );
        if (
            !(await this.container.redis.hget(
                `guildtriggers_${message.guild.id}`,
                trigger.unwrap()
            ))
        )
            return this.container.utility.errReply(
                message,
                'That trigger does not exist in this server.'
            );

        await this.container.redis.hdel(
            `guildtriggers_${message.guild.id}`,
            trigger.unwrap()
        );

        return message.reply(
            `Successfully removed \`${trigger.unwrap()}\` from the list of message triggers.`
        );
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const trigger = interaction.options.getString('trigger');
        const key = `guildtriggers_${interaction.guild.id}`;
        if (!trigger || !(await this.container.redis.hget(key, trigger)))
            return interaction.reply({
                content: 'That trigger does not exist in this server.',
                ephemeral: true,
            });
        await this.container.redis.hdel(key, trigger);
        return interaction.reply(
            `Successfully removed \`${trigger}\` from the list of message triggers.`
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
                    .setDescription('Trigger')
                    .setRequired(true)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { RemoveVivekTriggerCommand };
