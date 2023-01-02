const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { Punishment } = require('../../library/db/entities/PunishmentEntity');

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
            options: ['delete-days'],
            description: 'Bans a member from the server.',
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
                'You must provide a valid member to ban.'
            );

        const reason = await args.restResult('string');
        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a reason to ban.'
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
            'BAN'
            // TODO duration
        );

        await this.container.punishments.sendPunishmentEmbed(
            rawMember.unwrap(),
            message.guild,
            'BAN'
        );

        const delete_days =
            args.getOption('days') === 'null'
                ? 0
                : Number(args.getOption('days'));

        await member.ban({ reason: reason.unwrap(), days: delete_days });

        const embed = await this.container.punishments.getChatPunishmentEmbed(
            rawMember.unwrap(),
            punishment,
            'BAN'
        );
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { BanCommand };
