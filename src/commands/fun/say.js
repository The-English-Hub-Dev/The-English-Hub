const { Command, Args } = require('@sapphire/framework');
const { Message, PermissionFlagsBits } = require('discord.js');

class SayCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'say',
            description: 'Says things you tell the bot to say.',
            usage: '[channel] <text>',
            aliases: ['echo'],
            preconditions: ['NotOrigCmdChannel', 'Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawChannel = await args.pickResult('guildTextChannel');
        const channel = rawChannel.isErr()
            ? message.channel
            : rawChannel.unwrap();

        if (
            !channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.ViewChannel) ||
            !channel
                .permissionsFor(message.guild.members.me)
                .has(PermissionFlagsBits.SendMessages)
        ) {
            return this.container.utility.errReply(
                message,
                'I do not have permission to view or send messages in that channel.'
            );
        }

        const text = await args.restResult('string');
        if (text.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide something for me to say.'
            );

        if (message.deletable) await message.delete();

        return channel.send({
            content: text.unwrap(),
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }
}
module.exports = { SayCommand };
