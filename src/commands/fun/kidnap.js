const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://tenor.com/view/thom-gif-gif-22589646',
    'https://tenor.com/view/kidnap-cat-kidnap-aaaaah-fear-horror-film-gif-21768777',
    'https://tenor.com/view/getting-kidnapped-who-killed-sara-season2-getting-a-bag-over-my-head-kidnapped-gif-21614958',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExem03Nmhpamttc2U2bWl4enNxNnczZjZuOXd3ZXpwd21uMDFhYzc3NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ViIh8qu8Y08swHV7dX/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aTQyYXZ5MjB5NGdvbTduYm5yZjdoM28zaTNlcGwxbTBuaTMxdHBwNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/wAbvOebK8lVm4sz2Fy/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTBxa2NmNjJjYmNtNjVmNGV2a2JlcGswZ3VtZjlycTFvNTVleGhhYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/PAbP0kXq6qDmCFWjHp/giphy.gif',
    'httpss.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTBxa2NmNjJjYmNtNjVmNGV2a2JlcGswZ3VtZjlycTFvNTVleGhhYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/CvCrwWi55IiXpdwNa5/giphy.gif',
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
