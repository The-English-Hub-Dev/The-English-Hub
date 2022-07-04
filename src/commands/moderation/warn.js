const { Command, Args } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');
const { Message } = require('discord.js');
const { Punishment } = require('../../library/db/entities/PunishmentEntity');
const { PunishmentType } = require('../../library/typings/index');

class WarnCommand extends Command {
    /**
     *
     * @param { Command.Context } context
     * @param { Command.Options } options
     */
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'warn',
            preconditions: ['Staff'],
            description: 'Warns a member in the server.',
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
                'You must provide a valid member to warn.'
            );

        const rawDuration = await args.pickResult('string');
        const duration = new Duration(rawDuration);
        if (!duration.success || !duration)
            return this.container.utility.errReply(
                message,
                'You must provide a valid duration for the warn.'
            );

        const reason = await args.restResult('string');
        if (!reason.success)
            return this.container.utility.errReply(
                message,
                'You must provide a reason to warn.'
            );

        const member = rawMember.value;

        if (
            member.roles.highest.position >
            message.member.roles.highest.position
        )
            return this.container.utility.errReply(
                message,
                'You cannot warn a user equal or higher to you in hierarchy.'
            );
        if (!member.manageable)
            return this.container.utility.errReply(
                message,
                'I do not have permissions to warn this member.'
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
            PunishmentType.WARN,
            duration.offset
        );

        await this.container.punishments.sendPunishmentEmbed(
            rawMember.value,
            message.guild,
            PunishmentType.WARN
        );

        const embed = await this.container.punishments.getChatPunishmentEmbed(
            rawMember.value,
            punishment,
            PunishmentType.WARN
        );
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { WarnCommand };
