const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHplMTR3dDk4aTh5NWQ0cHFzdTBuaWFmZDNsYmdld3F1cWZkazJsOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/fQPSEmdUgDjwQOh7Gf/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHplMTR3dDk4aTh5NWQ0cHFzdTBuaWFmZDNsYmdld3F1cWZkazJsOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H2GX5Ik1ILy5q/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3d2l1Y3loYmM4NTZsdjh3bDJnMml6eGd1bWxtcW02YnhoeXRxeHpoNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7528JmqtT7cwzV1S/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3d2l1Y3loYmM4NTZsdjh3bDJnMml6eGd1bWxtcW02YnhoeXRxeHpoNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1AHERo6g1I1dNh2sDa/giphy.gif',
];

class TickleCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'tickle',
            description: 'Tickle tickle.',
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
            this.container.utility.errReply(message, 'Tickle someone else :(');

        await message.channel.send({
            content: `${message.author} tickled ${member}`,
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
module.exports = { TickleCommand };
