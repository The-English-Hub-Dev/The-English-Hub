const {
    Command,
    Args,
    Events,
    MessageCommandContext,
} = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

class FlatBanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'flatban',
            aliases: ['flban'],
            description:
                'Calls the vcban command on the flat world guest room.',
            preconditions: ['VcActionPerms'],
            flags: ['perm', 'p'],
            usage: '<member> [reason]',
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     * @param { MessageCommandContext } ctx
     */
    async messageRun(message, args, ctx) {
        const rawMember = await args.pickResult('member');
        const reason = (await args.restResult('string')).unwrapOr(
            'No reason provided.'
        );

        if (rawMember.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a valid user to ban from a vc.'
            );
        }
        const member = rawMember.unwrap();

        if (member) {
            if (
                message.member.roles.highest.position <=
                member.roles.highest.position
            ) {
                return this.container.utility.errReply(
                    message,
                    'You may not vc ban members with equal or higher roles than you.'
                );
            }
        }

        message.content = `${ctx.prefix}vcban 1149541570257883277 ${member.id} ${reason}`;

        this.container.client.emit(Events.PreMessageParsed, message);

        if (args.getFlags('perm', 'p')) {
            await this.container.redis.hdel(
                'vcban',
                `${vChannel.id}:${member.id}`
            );
            await message.channel.send(
                'Member permanently banned from the flat world guest room. This can only be undone with the `?vcunban` command.'
            );
        }
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const member = interaction.options.getMember('member');
        return interaction.reply({
            content: 'TODO: Implement',
            ephemeral: true,
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

module.exports = { FlatBanCommand };
