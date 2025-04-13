const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://tenor.com/view/thom-gif-gif-22589646',
    'https://tenor.com/view/kidnap-cat-kidnap-aaaaah-fear-horror-film-gif-21768777',
    'https://tenor.com/view/getting-kidnapped-who-killed-sara-season2-getting-a-bag-over-my-head-kidnapped-gif-21614958',
];

class KidnapCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'kidnap',
            description: 'Does something fun.',
            usage: '<member>',
            aliases: ['kidn'],
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
