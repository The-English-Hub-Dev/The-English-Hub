const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class MoveAllCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'moveall',
            aliases: ['mvall', 'moveallvc'],
            preconditions: ['Staff'],
            usage: ['<channel type:VoiceChannel> <channel type:VoiceChannel>'],
            description:
                'Moves all members in a voice channel to another voice channel.',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const vc = await args.pickResult('guildVoiceChannel');
        if (vc.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid voice channel to be move everyone from.'
            );

        const vcMove = await args.pickResult('guildVoiceChannel');
        if (vcMove.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid voice channel to be move everyone to.'
            );

        const vcMembers = [...vc.unwrap().members.map((member) => member)];

        for (let i = 0; i < vcMembers.size; i++) {
            const member = vcMembers[i];
            await member.voice.setChannel(vcMove.unwrap());
        }

        return message.reply(
            `Moved ${vcMembers.size} members from ${vc.unwrap()} to ${vcMove.unwrap()}.`
        );
    }
}

module.exports = { MoveAllCommand };
