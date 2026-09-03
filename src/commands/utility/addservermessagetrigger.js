const { Command, Args } = require('@sapphire/framework');
const { SlashCommandBuilder } = require('@discordjs/builders');

class AddVivekTriggerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'addservermessagetrigger',
            aliases: ['addmessagetrigger', 'addtrigger', 'addservertrigger'],
            description:
                "Adds a trigger and response to the server's message triggers",
            preconditions: ['Admin'],
            usage: `<trigger> = <response>`,
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const rawMessage = await args.restResult('string');
        if (rawMessage.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide something to add to the message trigger list.'
            );
        }
        if (rawMessage.unwrap().indexOf('=') === -1) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid trigger and response to set in the format <trigger> = <response>.'
            );
        }

        const trigger = rawMessage.unwrap().split('=')[0].trim();
        if (trigger.length === 0)
            return this.container.utility.errReply(
                message,
                'You must provide a valid trigger to set.'
            );
        const response = rawMessage.unwrap().split('=')[1].trim();
        if (response.length === 0)
            return this.container.utility.errReply(
                message,
                'You must provide a valid response to set.'
            );

        await this.container.redis.hset(
            `guildtriggers_${message.guild.id}`,
            trigger,
            response
        );

        return message.reply(
            `Successfully added \`${response}\` as a response to the message trigger \`${trigger}\`.`
        );
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const rawMessage = interaction.options.getString('trigger_response');
        if (!rawMessage) {
            return interaction.reply({
                content: 'You must provide something to add to the message trigger list.',
                ephemeral: true,
            });
        }
        if (!rawMessage.includes('=')) {
            return interaction.reply({
                content: 'You must provide a valid trigger and response to set in the format <trigger> = <response>.',
                ephemeral: true,
            });
        }

        const [trigger, ...responseParts] = rawMessage.split('=');
        const cleanTrigger = trigger.trim();
        const response = responseParts.join('=').trim();
        if (!cleanTrigger || !response) {
            return interaction.reply({
                content: 'You must provide a valid trigger and response to set.',
                ephemeral: true,
            });
        }

        await this.container.redis.hset(
            `guildtriggers_${interaction.guild.id}`,
            cleanTrigger,
            response
        );
        return interaction.reply(
            `Successfully added \`${response}\` as a response to the message trigger \`${cleanTrigger}\`.`
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
                    .setName('trigger_response')
                    .setDescription('Trigger = response')
                    .setRequired(true)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { AddVivekTriggerCommand };
