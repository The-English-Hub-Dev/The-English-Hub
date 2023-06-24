const { Command, Args } = require('@sapphire/framework');
const { Message, EmbedBuilder, Colors } = require('discord.js');

class ServerUnmuteCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'servermute',
            aliases: ['smute', 'vcmute'],
            description: 'Server mutes a user in VC',
            usage: '<member> <reason>',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const member = await args.pickResult('member');
        if (member.isErr())
            return this.container.utility.errReply(
                message,
                'Provide a member to server mute.'
            );

        const reason = await args.restResult('string');
        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'Provide a reason to server mute this member.'
            );

        const memberToUnmute = member.unwrap();

        if (memberToUnmute.voice.mute) {
            return this.container.utility.errReply(
                message,
                'This member is already muted.'
            );
        }

        await memberToUnmute.voice.setMute(true, reason.unwrap());

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `Successfully server muted ${
                            memberToUnmute.user.tag
                        } for ${reason.unwrap()}`
                    )
                    .setColor(Colors.Green),
            ],
        });
    }
}

module.exports = { ServerUnmuteCommand };
