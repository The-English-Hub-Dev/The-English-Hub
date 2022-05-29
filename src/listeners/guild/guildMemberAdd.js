const { Listener, Events } = require("@sapphire/framework");
const { GuildMember } = require("discord.js");
const { welcomeChannel } = require("../../../config.json");

class GuildMemberAddListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      name: Events.GuildMemberAdd,
      event: Events.GuildMemberAdd,
    });
  }

  /**
   *
   * @param { GuildMember } member
   */
  async run(member) {
    const channel = member.guild.channels.cache.get(welcomeChannel);
    if (!channel || channel.type !== "GUILD_TEXT") return;
    return channel.send({
      content: `Welcome to ${member.guild.name}, ${member}`,
      allowedMentions: { users: [], roles: [], parse: [] },
    });
  }
}

module.exports = { GuildMemberAddListener };
