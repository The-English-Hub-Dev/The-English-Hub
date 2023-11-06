const { Command, Args } = require('@sapphire/framework');
const { Message, PermissionFlagsBits } = require('discord.js');
const { mvAllowed } = require('../../../config.json');

class MvCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'mv',
            aliases: ['moveme', 'movevc', 'movemevc'],
            preconditions: ['MoveMe'],
            usage: ['<channel type:VoiceChannel>'],
            description: 'Moves you into a certain voice channel.',
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
                'You must provide a valid voice channel to be moved into.'
            );

        if (!message.member.voice.channel)
            return this.container.utility.errReply(
                message,
                'You must be in a voice channel to use this command otherwise I cannot move you to a new channel.'
            );

        if (!mvAllowed.includes(vc.unwrap().parent.id)) {
            return this.container.utility.errReply(
                message,
                'You can only move yourself to channels in the `Practice English` Category'
            );
        }
        if (
            !message.member
                .permissionsIn(vc.unwrap())
                .has(PermissionFlagsBits.ViewChannel)
        )
            return this.container.utility.errReply(
                message,
                "You are not allowed to move yourself to that channel as it isn't visible to you."
            );
        try {
            await message.member.voice.setChannel(
                vc.unwrap(),
                `${message.member.user.tag} requested to be moved with the moveme command.`
            );
        } catch (error) {
            return message.reply(
                `I could not move you to that channel. Error: ${error}`
            );
        }

        return message.reply(
            `You have been successfully moved to ${vc.unwrap()}`
        );
    }
}

module.exports = { MvCommand };
