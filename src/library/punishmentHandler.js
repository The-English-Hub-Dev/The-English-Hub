const { container } = require("@sapphire/framework");
const { Duration } = require("@sapphire/time-utilities");
const { GuildMember, User, Guild } = require("discord.js");
const { PunishmentEntity } = require("./db/entities/PunishmentEntity");
const { PunishmentType, Context } = require("./typings/index");

class PunishmentHandler {
  /**
   *
   * @param { User } user
   * @param { Duration } duration
   * @param { PunishmentType } type
   * @param { String } reason
   * @param { Context } ctx
   */
  async punish(user, duration, type, reason, ctx) {
    const member = ctx.guild.members.resolve(user);
    const isMember = !!member;

    if (isMember) {
      const checkResult = await this.memberChecks(member, ctx);
      if (!checkResult) return;
    }

    if (
      [
        PunishmentType.MUTE,
        PunishmentType.UNMUTE,
        PunishmentType.KICK,
      ].includes(type) &&
      !isMember
    )
      return container.utility.errReply(
        ctx.message,
        "I cannot mute or kick a member not in this server."
      );

    const punishment = new PunishmentEntity({
      type: type,
      moderator: ctx.message.member.user,
      target_user: user,
      duration: duration.offset,
    });

    switch (type) {
      case PunishmentType.MUTE:
        await member.timeout(duration.offset, reason);
        break;
      case PunishmentType.KICK:
        await member.kick(reason);
      default:
        break;
    }
  }

  /**
   *
   * @param { GuildMember } member
   */
  async warn(member) {}

  async mute(member) {}

  async unmute(member) {}

  async kick(member) {}

  async ban(user) {}

  async unban(user) {}

  /**
   *
   * @param { GuildMember } member
   * @param { Context } ctx
   */
  async memberChecks(member, ctx) {
    if (
      member.roles.highest.position >= ctx.message.member.roles.highest.position
    ) {
      container.utility.errReply(
        ctx.message,
        "You cannot punish someone equal or higher to you in hierarchy."
      );
      return false;
    }

    if (!member.manageable) {
      container.utility.errReply(
        ctx.message,
        "I do not have permissions to punish this member."
      );
      return false;
    }
    return true;
  }
}

module.exports = { PunishmentHandler, PunishmentType };
