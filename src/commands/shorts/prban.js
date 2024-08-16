const { Command, Args, Events } = require('@sapphire/framework');
const { Message } = require('discord.js');

class PrbanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'prban',
            aliases: ['politicsandreligionban'],
            description:
                'Calls the vcban command on the politics and religion guest room.',
            preconditions: ['VcActionPerms'],
            usage: '<member> [reason]',
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
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

        message.content = `vcban 1222540798201954404 ${member.id} ${reason}`;

        this.container.client.emit(Events.PreMessageParsed, message);
    }
}

module.exports = { PrbanCommand };
