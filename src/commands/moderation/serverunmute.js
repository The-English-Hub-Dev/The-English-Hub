const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    time,
    TimestampStyles,
} = require('discord.js');
const { logChannel } = require('../../../config.json');

class ServerUnmuteCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'serverunmute',
            aliases: ['sunmute', 'vcunmute'],
            description: 'Server unmutes a user in VC',
            usage: '<member> <reason>',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const member = await args.pickResult('member');
        if (member.isErr())
            return this.container.utility.errReply(
                message,
                'Provide a member to server unmute.'
            );

        const reason = await args.restResult('string');
        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'Provide a reason to server unmute this member.'
            );

        const memberToUnmute = member.unwrap();

        if (!memberToUnmute.voice.channel)
            return this.container.utility.errReply(
                message,
                'This member is not in a voice channel. You can only server unmute members in voice channels.'
            );

        if (!memberToUnmute.voice.serverMute) {
            return this.container.utility.errReply(
                message,
                'This member is not server muted.'
            );
        }

        await memberToUnmute.voice.setMute(false, reason.unwrap());

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `Successfully **server unmuted** ${
                            memberToUnmute.user.tag
                        } for ${reason.unwrap()}`
                    )
                    .setColor(Colors.DarkOrange),
            ],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { GuildMember } member
     * @param { String } reason
     * @returns
     */
    async logServermute(message, member, reason) {
        const logEmbed = new EmbedBuilder()
            .setColor(Colors.DarkBlue)
            .setTitle('Server Unmute')
            .setAuthor({
                name: member.user.tag,
                iconURL: member.user.avatarURL(),
            })
            .addFields(
                {
                    name: 'User',
                    value: `${member.user.tag} (${member.user.id})`,
                },
                {
                    name: 'Moderator',
                    value: `${message.author.tag} (${message.author.id})`,
                },
                { name: 'Reason', value: reason },
                {
                    name: 'Date',
                    value: time(new Date(), TimestampStyles.LongDateTime),
                }
            )
            .setFooter({
                text: 'Moderation Logs',
                iconURL: message.guild.iconURL(),
            })
            .setThumbnail(this.container.client.user.avatarURL());

        const logCh = message.guild.channels.cache.get(logChannel);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] }).catch();
    }
}

module.exports = { ServerUnmuteCommand };
