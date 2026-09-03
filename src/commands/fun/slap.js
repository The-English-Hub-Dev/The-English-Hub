const { Command, Args } = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const gifs = [
    'https://tenor.com/view/batman-robin-slap-cachetada-meme-cachetazo-gif-14588588888076113146',
    'https://tenor.com/view/taiga-toradora-fast-slap-slap-baka-gif-11264049955690132886',
    'https://tenor.com/view/slap-christmas-gif-24241359',
];

class SlapCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'slap',
            description: 'Does something VERY exciting.',
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

        await message.channel.send(
            gifs[Math.floor(Math.random() * gifs.length)]
        );

        return message.channel.send({
            content: `${message.author} slapped ${member} <:Joemad:1329355163034456074>`,
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

        await interaction.reply(gifs[Math.floor(Math.random() * gifs.length)]);

        return interaction.channel?.send({
            content: `${interaction.user} slapped ${member} <:Joemad:1329355163034456074>`,
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
            .addUserOption((option) =>
                option
                    .setName('member')
                    .setDescription('Target')
                    .setRequired(true)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}
module.exports = { SlapCommand };
