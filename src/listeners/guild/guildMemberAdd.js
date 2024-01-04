const { Listener, Events } = require('@sapphire/framework');
const {
    GuildMember,
    ChannelType,
    EmbedBuilder,
    TimestampStyles,
    time,
    Colors,
} = require('discord.js');
const { welcomeChannel, mainChannel } = require('../../../config.json');

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
        await this.checkMilestone(member);
        await this.sendWelcomeDM(member);
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

    /**
     *
     * @param { GuildMember } member
     */
    async checkMilestone(member) {
        if (member.guild.memberCount % 1000 != 0) return;
        const channel = member.guild.channels.cache.get(mainChannel);
        if (!channel || channel.type !== ChannelType.GuildText) return;

        const milestoneEmbed = new EmbedBuilder()
            .setTitle(`We've hit a membercount milestone!`)
            .setColor(Colors.LuminousVividPink)
            .setDescription(
                `We've hit **${member.guild.memberCount.toLocaleString()}** members!\nMilestone achieved at ${time(
                    new Date(),
                    TimestampStyles.LongDateTime
                )}`
            )
            .setFooter({
                text: `Milestone reached!`,
            });

        return channel.send({
            embeds: [milestoneEmbed],
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }

    /**
     * @param { GuildMember } member
     */
    async sendWelcomeDM(member) {
        const welcomeDMEmbed = new EmbedBuilder()
            .setTitle('Welcome to the English Hub')
            .setColor(Colors.Aqua)
            .setDescription(
                `Hello, ${member} Welcome to a world of eclectic English learning. Chat with fellow members, share resources. Improve your skills through our English classes and active voice channels. If you need any help, use <#852953549112606821> to contact moderators.`
            )
            .setImage('https://imgur.com/1GZVpS1.png')
            .setFooter(`Welcome!`)
            .setTimestamp();

        await member
            .send({
                content: `${member}`,
                embeds: [welcomeDMEmbed],
                allowedMentions: { users: [member.id], roles: [], parse: [] },
            })
            .catch(() => {});
        return member.send('https://discord.gg/enghub').catch(() => {});
    }
}

module.exports = { GuildMemberAddListener };
