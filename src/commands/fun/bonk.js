const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class BonkCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'bonk',
            description: 'Bonk bonk.',
            usage: '<member>',
            aliases: [],
            preconditions: ['NotOrigCmdChannel', 'Staff'],
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

        return message.channel.send({
            content: `${message.author} bonked ${member} 🫂`,
            allowedMentions: {
                users: [member.id, message.author.id],
                roles: [],
                parse: [],
            },
        });
    }
}
module.exports = { BonkCommand };
