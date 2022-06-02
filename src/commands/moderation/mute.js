const { Command, Args } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');
const { Message } = require('discord.js');
const { Punishment } = require('../../library/db/entities/PunishmentEntity');
const { PunishmentType } = require('../../library/typings');

class MuteCommand extends Command {
    /**
     *
     * @param { Command.Context } context
     * @param { Command.Options } options
     */
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'mute',
            preconditions: ['Staff'],
            description: 'Mutes a member in the server.',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        if (!rawMember.success)
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to mute.'
            );

        const rawDuration = await args.pickResult('string');
        const duration = new Duration(rawDuration.value);
        if (!duration.success || !duration)
            return this.container.utility.errReply(
                message,
                'You must provide a valid duration to mute for.'
            );

        const reason = await args.restResult('string');
        if (!reason.success)
            return this.container.utility.errReply(
                message,
                'You must provide a reason to mute.'
            );

        const member = rawMember.value;

        if (
            member.roles.highest.position >
            message.member.roles.highest.position
        )
            return this.container.utility.errReply(
                message,
                'You cannot mute a user equal or higher to you in hierarchy.'
            );
        if (!member.kickable)
            return this.container.utility.errReply(
                message,
                'I do not have permissions to mute this member.'
            );
        if (reason.value.length > 100)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        const punishment = new Punishment(
            message.author.id,
            rawMember.value.id,
            reason.value,
            PunishmentType.MUTE,
            duration.offset
        );

        await this.container.punishments.sendPunishmentEmbed(
            rawMember.value,
            message.guild,
            PunishmentType.MUTE
        );

        await member.timeout(duration.offset, reason.value);

        const embed = await this.container.punishments.getChatPunishmentEmbed(
            rawMember.value,
            punishment,
            PunishmentType.MUTE
        );
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { KickCommand };
