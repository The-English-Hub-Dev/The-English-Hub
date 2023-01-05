const { Command, Args } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');
const { Message } = require('discord.js');
const { Punishment } = require('../../library/db/entities/PunishmentEntity');

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
            enabled: false,
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        if (rawMember.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to mute.'
            );

        const rawDuration = await args.pickResult('string');
        const duration = new Duration(rawDuration.unwrap());
        if (!duration.success || !duration)
            return this.container.utility.errReply(
                message,
                'You must provide a valid duration to mute for.'
            );

        const reason = await args.restResult('string');
        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a reason to mute.'
            );

        const member = rawMember.unwrap();

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
        if (reason.unwrap().length > 100)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        const punishment = new Punishment(
            message.author.id,
            rawMember.unwrap().id,
            reason.unwrap(),
            'MUTE',
            duration.offset
        );

        await this.container.punishments.sendPunishmentEmbed(
            rawMember.unwrap(),
            message.guild,
            'MUTE'
        );

        await member.timeout(duration.offset, reason.unwrap());

        const embed = await this.container.punishments.getChatPunishmentEmbed(
            rawMember.unwrap(),
            punishment,
            'MUTE'
        );
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { MuteCommand };
