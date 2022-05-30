const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { PunishmentEntity } = require('../../library/db/entities/PunishmentEntity');
const { PunishmentType } = require('../../library/typings');

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
                    'You cannot ban a user equal or higher to you in hierarchy.'
                );
            if (!member.kickable)
                return this.container.utility.errReply(
                    message,
                    'I do not have permissions to ban this member.'
                );
        }

        if (reason.value.length > 1000)
            return this.container.utility.errReply(
                message,
                'The reason must be less than 100 characters.'
            );

        await member.ban({reason: reason.value, days: args.getOption('delete-days') ?? 5});

        const punishment = new PunishmentEntity({
          moderator_id: message.author.id,
          target_user_id: rawUser.value.id,
          guild_id: message.guild.id,
      });

      await punishment.save();

      await this.container.punishments.sendPunishmentEmbed(rawUser.value, message.guild, PunishmentType.BAN);

      const embed = await this.container.punishments.getChatPunishmentEmbed(); 
      return message.channel.send({embeds: [embed]});
    }
}

module.exports = { BanCommand };
