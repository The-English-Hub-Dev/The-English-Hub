const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { Punishment } = require('../../library/db/entities/PunishmentEntity');

class UnbanCommand extends Command {
    /**
     *
     * @param { Command.Context } context
     * @param { Command.Options } options
     */
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'unban',
            preconditions: ['Staff'],
            description: 'Unbans a user from the server.',
            enabled: false,
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawUser = await args.pickResult('user');
        if (rawUser.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to unban.'
            );

        const reason = await args.restResult('string');
        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a reason to unban.'
            );

        const rawMember = await message.guild.members
            .fetch(rawUser)
            .catch(() => null);

        if (reason.unwrap().length > 100)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        const punishment = new Punishment(
            message.author.id,
            rawUser.unwrap().id,
            reason.unwrap(),
            'UNBAN',
            null
        );

        const isBanned = await message.guild.bans
            .fetch(rawUser.unwrap().id)
            .catch(() => null);
        if (!isBanned)
            return this.container.utility.errReply(
                message,
                'That user is not banned.'
            );

        await message.guild.members.unban(rawUser.unwrap().id, reason.unwrap());

        const embed = await this.container.punishments.getChatPunishmentEmbed(
            rawMember.unwrap(),
            punishment,
            'UNBAN'
        );
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { UnbanCommand };
