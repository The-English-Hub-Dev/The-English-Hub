const { Command } = require('@sapphire/framework');
const {
    Message,
    time,
    TimestampStyles,
    Colors,
    EmbedBuilder,
    GuildMember,
    VoiceChannel,
} = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

class ViewVcbanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'viewbcbans',
            aliases: ['viewvcb', 'viewvcrestricts'],
            description: 'Shows you the current active VC bans.',
            preconditions: ['Staff'],
        });
    }

    /**
     * @param { Message } message
     */
    async messageRun(message) {
        const allvcbans = Object.entries(
            await this.container.redis.hgetall('vcban')
        );

        const vcs = {};
        for (var i = 0; i < allvcbans.length; i++) {
            const [vChannelID, memberID] = allvcbans[i][0].split(':');
            if (vChannelID in vcs) {
                vcs[vChannelID].push(
                    `<@${memberID}> (${memberID} - ${(await this.container.client.users.fetch(memberID)).tag}) Expires: ${time(new Date(Number(allvcbans[i][1]) + Time.Day), TimestampStyles.RelativeTime)}`
                );
            } else {
                vcs[vChannelID] = [
                    `<@${memberID}> (${memberID} - ${(await this.container.client.users.fetch(memberID)).tag}) Expires: ${time(new Date(Number(allvcbans[i][1]) + Time.Day), TimestampStyles.RelativeTime)}`,
                ];
            }
        }

        const vcString = Object.entries(vcs)
            .map(
                (vc) =>
                    `Members banned from <#${vc[0]}>:\n${vc[1].join('\n')}\n`,
                ''
            )
            .join('\n');

        const vcbanEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle(`Current active VC Bans`)
            .setDescription(vcString)
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        return message.reply({ embeds: [vcbanEmbed] });
    }
}

module.exports = { ViewVcbanCommand };
