const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { Punishment } = require('../../library/db/entities/PunishmentEntity');

class KickCommand extends Command {
    /**
     *
     * @param { Command.Context } context
     * @param { Command.Options } options
     */
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'kick',
            preconditions: ['Staff'],
            description: 'Kicks a member from the server.',
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
                'You must provide a valid member to kick.'
            );

        const reason = await args.restResult('string');
        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a reason to kick.'
            );

        const member = rawMember.unwrap();

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
        if (reason.unwrap().length > 100)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        const punishment = new Punishment(
            message.author.id,
            rawMember.unwrap().id,
            reason.unwrap(),
            'KICK',
            null
        );

        await this.container.punishments.sendPunishmentEmbed(
            rawMember.unwrap(),
            message.guild,
            'KICK'
        );

        await member.kick(reason.unwrap());

        const embed = await this.container.punishments.getChatPunishmentEmbed(
            rawMember.unwrap(),
            punishment,
            'KICK'
        );
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { KickCommand };
