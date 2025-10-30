const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const gifs = [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG9kc3Z2ZDdlbGUzdWVsbHh5MHRhNDY3eWJvZHY3ZXBjY2cxb2tsciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SzC42gUrhHopW/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG9kc3Z2ZDdlbGUzdWVsbHh5MHRhNDY3eWJvZHY3ZXBjY2cxb2tsciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/UENGrMFTLUKUE/giphy.gif',
    'httpsS.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG9kc3Z2ZDdlbGUzdWVsbHh5MHRhNDY3eWJvZHY3ZXBjY2cxb2tsciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qIfG2193qAwGgw4hdg/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MmVlcnIwaHF1eDkyaHBoYnIzeXlyMGhzNDc0cHN0eG9wYTV4ZGk3OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/VZVK5WCg0A0H37s8ND/giphy.gif',
];

class PunchCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'punch',
            description: 'Punches something (or someone?).',
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

        if (member.id === message.author.id)
            this.container.utility.errReply(
                message,
                'Why are you punching yourself :('
            );

        await message.channel.send(
            gifs[Math.floor(Math.random() * gifs.length)]
        );
    }
}
module.exports = { PunchCommand };
