const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTF0ZWNqeDJucTlnbTQyeXI2OWpycm56cDdmcDFneDZkdTVkbHZhYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/kUwcg45mftfCD5XXy2/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTF0ZWNqeDJucTlnbTQyeXI2OWpycm56cDdmcDFneDZkdTVkbHZhYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oz8xZJLhFMmwvdMWI/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTF0ZWNqeDJucTlnbTQyeXI2OWpycm56cDdmcDFneDZkdTVkbHZhYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mNLc4BDgcmBN8kPfkf/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cnI3ZXJuYTgyMG5zcXJvMTloenBzdnd2Nm1veHpiZmdramZkbGdmMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/eg4t0mu8Bsp4N8sjrC/giphy.gif',
];

class WhisperCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'whisper',
            description: "What? I can't heard you.",
            usage: '<member>',
            aliases: [],
            preconditions: ['Staff'],
            enabled: false,
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
            this.container.utility.errReply(
                message,
                "You can't whisper to yourself :("
            );

        await message.channel.send(
            gifs[Math.floor(Math.random() * gifs.length)]
        );

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
module.exports = { WhisperCommand };
