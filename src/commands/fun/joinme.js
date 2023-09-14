const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

class JoinMeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'joinme',
            description: 'Does something very cool in vc.',
            aliases: ['jm'],
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     */
    async messageRun(message) {
        const channel = message.member.voice.channel;
        if (!channel)
            return this.container.utility.errReply(
                message,
                'You must be a in a VC for the bot to join you.'
            );

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    }
}
module.exports = { JoinMeCommand };
