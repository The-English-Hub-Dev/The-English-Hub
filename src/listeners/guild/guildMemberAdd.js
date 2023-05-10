const { Listener, Events } = require('@sapphire/framework');
const { GuildMember, ChannelType } = require('discord.js');
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
        if (!channel || channel.type !== ChannelType.GuildText) return;
        return channel.send({
            content: `Ahoy ${member}, Welcome to ${member.guild.name}!\nSelect <id:customize> to get started. <a:enghub:932293018185244742>`,
            allowedMentions: { users: [member.id], roles: [], parse: [] },
        });
    }
}

module.exports = { GuildMemberAddListener };
