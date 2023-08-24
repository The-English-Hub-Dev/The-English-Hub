const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class KidnapCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'kidnap',
            description: 'Does something fun.',
            usage: '<member>',
            aliases: ['kidn'],
            preconditions: ['Staff'],
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

        return message.channel.send({
            content: `${member} has been kidnapped by ${message.author} for 1 hour`,
            allowedMentions: {
                users: [member.id, message.author.id],
                roles: [],
                parse: [],
            },
        });
    }
}
module.exports = { KidnapCommand };
