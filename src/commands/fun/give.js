const { Command, Args } = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const gifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmgxNXhqaGxsa2ducnd1aWx4cGphNmkyaGh3Mmpyazl5ZWVqczd1ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jeagYTY1lJYrIoOPel/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGRyZ3gyY3JmZGFndXo3N2xwOXlleDhiZHRiZXNwZ21kY3RkeDB1eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bwBYKgvEsKt4rsI1jJ/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGl3cjFhbGFyZGs5OW10MWhiMW9mZ3FxM2w0bHRydXVhNTB6a2picSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/NtXQ8BG1qi2nYDYJa1/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGl3cjFhbGFyZGs5OW10MWhiMW9mZ3FxM2w0bHRydXVhNTB6a2picSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ptjdQLYpKgiUWwLz64/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGl3cjFhbGFyZGs5OW10MWhiMW9mZ3FxM2w0bHRydXVhNTB6a2picSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QrIZjS3sYH8eN1xlHA/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eGU2c3NsbmVvdmMxdTlra3dhZHV3cXhnZnVodHh2NnlwdW5ja3dzeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/HhwymqR9NNUxBBIxsR/giphy.gif',
];

class GiveCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'give',
            description: 'Gives something.',
            usage: '<member>',
            aliases: [],
            preconditions: ['FunCmd'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        if (rawMember.isErr())
            return this.container.utility.errReply(
                message,
                'You must mention a member.'
            );

        const member = rawMember.unwrap();
        if (message.deletable) await message.delete();

        if (member.id === message.author.id)
            this.container.utility.errReply(
                message,
                "You can't give something to yourself :("
            );

        await message.channel.send({
            content: `${member} got a gift from ${message.author}`,
            allowedMentions: {
                users: [member.id, message.author.id],
                roles: [],
                parse: [],
            },
        });
        await message.channel.send(
            gifs[Math.floor(Math.random() * gifs.length)]
        );
    }

    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const member = interaction.options.getMember('member');

        if (!member) {
            return interaction.reply({
                content: 'You must mention a member.',
                ephemeral: true,
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: "You can't give something to yourself :(",
                ephemeral: true,
            });
        }

        await interaction.reply({
            content: `${member} got a gift from ${interaction.user}`,
            allowedMentions: {
                users: [member.id, interaction.user.id],
                roles: [],
                parse: [],
            },
        });

        return interaction.channel?.send(
            gifs[Math.floor(Math.random() * gifs.length)]
        );
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addMemberOption((option) =>
                option
                    .setName('member')
                    .setDescription('The member to give to')
                    .setRequired(true)
            );

        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { GiveCommand };
