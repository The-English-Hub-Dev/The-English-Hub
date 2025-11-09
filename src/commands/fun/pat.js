const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXk3OXp2aHU5YXdtcjA5OHRtcjNueTZvY3Zjd251N2t4Z3k3YjU4OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gL6eoV6ScTOnk7WfbS/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3amo4NjBnam9wampucTNjeW42MHE0ajhwaXRoNnJhMGg2OXRub295ZiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/g9wyTh6aWsCGzu4NgY/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXk3OXp2aHU5YXdtcjA5OHRtcjNueTZvY3Zjd251N2t4Z3k3YjU4OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/N0CIxcyPLputW/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXk3OXp2aHU5YXdtcjA5OHRtcjNueTZvY3Zjd251N2t4Z3k3YjU4OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/X42IAaDJ42pHqPllGk/giphy.gif',
];

class PatCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'pat',
            description: 'Pat pat.',
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
            this.container.utility.errReply(message, 'Pat someone else!');

        await message.channel.send({
            content: `${message.author} pats ${member}`,
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
}
module.exports = { PatCommand };
