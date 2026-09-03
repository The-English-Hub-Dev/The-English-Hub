const { Command, Args } = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const gifs = [
    'https://tenor.com/view/hug-love-hi-bye-cat-gif-5711781834381685182',
    'https://tenor.com/view/hug-hugs-and-love-gif-8468000449870090869',
    'https://tenor.com/view/hugs-love-no-crying-gif-167604756388140396',
];

class HugCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'hug',
            description: 'Does something sweet.',
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
            this.container.utility.errReply(message, 'Hug someone else :(');

        await message.channel.send(
            gifs[Math.floor(Math.random() * gifs.length)]
        );

        return message.channel.send({
            content: `${message.author} hugged ${member} 🫂`,
            allowedMentions: {
                users: [member.id, message.author.id],
                roles: [],
                parse: [],
            },
        });
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
                content: 'Hug someone else :(',
                ephemeral: true,
            });
        }

        await interaction.reply(gifs[Math.floor(Math.random() * gifs.length)]);

        return interaction.channel?.send({
            content: `${interaction.user} hugged ${member} 🫂`,
            allowedMentions: {
                users: [member.id, interaction.user.id],
                roles: [],
                parse: [],
            },
        });
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
                    .setDescription('The member to hug')
                    .setRequired(true)
            );

        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { HugCommand };
