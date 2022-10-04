const { Listener, Events } = require('@sapphire/framework');
const { GuildMember } = require('discord.js');
const { welcomeChannel } = require('../../../config.json');

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
        await this.welcomeMember(member);
    }

    /**
     *
     * @param { GuildMember } member
     */
    async welcomeMember(member) {
        const channel = member.guild.channels.cache.get(welcomeChannel);
        if (!channel || channel.type !== 'GUILD_TEXT') return;
        return channel.send({
            content: `Ahoy ${member}, Welcome to ${member.guild.name}!\nGet <#942012209146515496> to customize your profile, join English classes and gain access to all channels. Join voice channels and start practicing your English. <a:enghub:932293018185244742>`,
            allowedMentions: { users: [member.id], roles: [], parse: [] },
        });
    }
}

module.exports = { GuildMemberAddListener };
