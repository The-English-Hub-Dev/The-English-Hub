const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://tenor.com/view/hug-love-hi-bye-cat-gif-5711781834381685182',
    'https://tenor.com/view/hug-hugs-and-love-gif-8468000449870090869',
    'https://tenor.com/view/hugs-love-no-crying-gif-167604756388140396',
];

class HugCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'hug',
            description: 'Does something sweet.',
            usage: '<member>',
            aliases: [],
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
        if (message.deletable) await message.delete();

        await message.channel.send(
            gifs[Math.floor(Math.random() * gifs.length)]
        );

        if (member.id === message.author.id)
            this.container.utility.errReply(message, 'Hug someone else.');

        return message.channel.send({
            content: `${message.author} hugged ${member} 🫂`,
            allowedMentions: {
                users: [member.id, message.author.id],
                roles: [],
                parse: [],
            },
        });
    }
}
module.exports = { HugCommand };
