const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class BanCommand extends Command {
    /**
     *
     * @param { Command.Context } context
     * @param { Command.Options } options
     */
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ban',
            preconditions: ['Staff'],
            description: 'Bans a user from the server.',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawUser = await args.pickResult('user');
        if (!rawUser.success)
            return this.container.utility.errReply(
                message,
                'You must provide a valid user to ban.'
            );

        const reason = await args.restResult('string');
        if (!reason.success)
            return this.container.utility.errReply(
                message,
                'You must provide a reason to ban.'
            );

        const member = message.guild.members.resolve(rawUser.value);
        if (member) {
            if (
                member.roles.highest.position >
                message.member.roles.highest.position
            )
                return this.container.utility.errReply(
                    message,
                    'You cannot kick a user equal or higher to you in hierarchy.'
                );
            if (!member.kickable)
                return this.container.utility.errReply(
                    message,
                    'I do not have permissions to kick this member.'
                );
        }

        if (reason.value.length > 1000)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        await member.kick(reason.value);

        return message.reply();
    }
}

module.exports = { BanCommand };
