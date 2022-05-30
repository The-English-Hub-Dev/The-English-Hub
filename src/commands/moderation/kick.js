const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { PunishmentEntity } = require('../../library/db/entities/PunishmentEntity');
const { PunishmentType } = require('../../library/typings');

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
                'You must provide a valid member to kick.'
            );

        const reason = await args.restResult('string');
        if (!reason.success)
            return this.container.utility.errReply(
                message,
                'You must provide a reason to kick.'
            );

        const member = rawMember.value;

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
        if (reason.value.length > 1000)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        const punishment = new PunishmentEntity({
            moderator_id: message.author.id,
            target_user_id: rawMember.value.id,
            guild_id: message.guild.id,
        });

        await punishment.save();

        await this.container.punishments.sendPunishmentEmbed(rawMember.value, message.guild, PunishmentType.KICK);

        const embed = await this.container.punishments.getChatPunishmentEmbed() 
        return message.channel.send({embeds: [embed]});
    }
}

module.exports = { KickCommand };
