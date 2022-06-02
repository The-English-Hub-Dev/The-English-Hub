const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { Punishment } = require('../../library/db/entities/PunishmentEntity');
const { PunishmentType } = require('../../library/typings');

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
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawUser = await args.pickResult('user');
        if (!rawMember.success)
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to unban.'
            );

        const reason = await args.restResult('string');
        if (!reason.success)
            return this.container.utility.errReply(
                message,
                'You must provide a reason to unban.'
            );

        const member = rawMember.value;

        if (reason.value.length > 100)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        const punishment = new Punishment(
            message.author.id,
            rawUser.value.id,
            reason.value,
            PunishmentType.UNBAN,
            null
        );

        const isBanned = await message.guild.bans.fetch(rawUser.value.id).catch(() => null);
        if (!isBanned) return this.container.utility.errReply(message, 'That user is not banned.');

        await message.guild.members.unban(rawUser.value.id, reason.value);

        const embed = await this.container.punishments.getChatPunishmentEmbed(
            rawMember.value,
            punishment,
            PunishmentType.BAN
        );
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { UnbanCommand };
