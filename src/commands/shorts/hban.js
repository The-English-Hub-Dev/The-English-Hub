const {
    Command,
    Args,
    Events,
    MessageCommandContext,
} = require('@sapphire/framework');
const { Message, ChatInputCommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { runVcShortcut } = require('../../library/vcShortcut');

class HBanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'hban',
            aliases: ['healthban'],
            description:
                'Calls the vcban command on the mental health cafe guest room.',
            preconditions: ['VcActionPerms'],
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

        message.content = `${ctx.prefix}vcban 1375597364890308770 ${member.id} ${reason}`;

        this.container.client.emit(Events.PreMessageParsed, message);
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        return runVcShortcut(
            interaction,
            this.container,
            '1375597364890308770'
        );
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
            )
            .addStringOption((option) =>
                option
                    .setName('reason')
                    .setDescription('Reason')
                    .setRequired(false)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { HBanCommand };
