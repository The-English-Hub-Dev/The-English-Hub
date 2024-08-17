const {
    Command,
    Args,
    Events,
    MessageCommandContext,
} = require('@sapphire/framework');
const { Message } = require('discord.js');

class VeganUnBanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'veganunban',
            aliases: ['veganvcunban'],
            description: 'Calls the vcunban command on the vegan guest room.',
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
                'You must provide a valid user to unban from a vc.'
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
                    'You may not vc unban members with equal or higher roles than you.'
                );
            }
        }

        message.content = `${ctx.prefix}vcunban 1222056499959042108 ${member.id} ${reason}`;

        this.container.client.emit(Events.PreMessageParsed, message);
    }
}

module.exports = { VeganUnBanCommand };
