const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczQ4eDl1dzRoaWI0am9idW80empieHo1eW8zOGRodm55ZmduanFxNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/VRnt1pl7eseuqia7f6/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczQ4eDl1dzRoaWI0am9idW80empieHo1eW8zOGRodm55ZmduanFxNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gkONMypx1LOzcQq2D8/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTh2c3Bwb3Q3YjJ0OThueW10MnNtNzBjNzk0MWxoODg2bW96cjB1dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/wIU9MjBVKF4Qw/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3YzhheGw2emxwYWF2aGhzMDlxejBkcm5lYTh6ZnMxZzhjcWFoOGR2ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QhmuOyBUTKlpVYpi9D/giphy.gif',
];

class YeetCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'yeet',
            description: 'Yeets you into the oblivian.',
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
            this.container.utility.errReply(message, 'Yeet someone else :(');

        await message.channel.send({
            content: `${member} just got yeeted by ${message.author}`,
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
module.exports = { YeetCommand };
