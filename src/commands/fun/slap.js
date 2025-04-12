const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://tenor.com/view/too-much-alarm-sound-the-gif-24675087',
    'https://tenor.com/view/blu-zushi-black-and-white-emotes-gif-13851867247344432124',
    'https://tenor.com/view/batman-robin-slap-cachetada-meme-cachetazo-gif-14588588888076113146',
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
}
module.exports = { SlapCommand };
