const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    TimestampStyles,
    time,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

class ServerUnmuteCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'servermute',
            aliases: ['smute', 'vcmute'],
            description: 'Server mutes a user in VC',
            usage: '<member> <reason>',
            preconditions: ['VcMutePerms'],
            enabled: false,
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
                'Provide a member to server mute.'
            );

        const reason = await args.restResult('string');
        if (reason.isErr())
            return this.container.utility.errReply(
                message,
                'Provide a reason to server mute this member.'
            );

        const memberToUnmute = member.unwrap();

        if (memberToUnmute.voice.serverMute) {
            return this.container.utility.errReply(
                message,
                'This member is already muted.'
            );
        }

        if (!memberToUnmute.voice.channel)
            return this.container.utility.errReply(
                message,
                'This member is not in a voice channel. You can only server mute members in voice channels.'
            );

        await memberToUnmute.voice.setMute(true, reason.unwrap());

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `Successfully **server muted** ${
                            memberToUnmute.user.tag
                        } for ${reason.unwrap()}`
                    )
                    .setColor(Colors.Green),
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
            .setColor(Colors.Aqua)
            .setTitle('Server Mute')
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

        const logCh = message.guild.channels.cache.get(logChannelID);
        if (!logCh) return;

        return logCh.send({ embeds: [logEmbed] }).catch();
    }
    /**
     * @param { ChatInputCommandInteraction } interaction
     */
    async chatInputRun(interaction) {
        const member = interaction.options.getMember('member');
        return interaction.reply({
            content: 'TODO: Implement',
            ephemeral: true,
        });
    }

    /**
     * @param { Command.Registry } registry
     */
    registerApplicationCommands(registry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addMemberOption((option) =>
                option
                    .setName('member')
                    .setDescription('Target')
                    .setRequired(true)
            );
        registry.registerChatInputCommand(builder, {
            preconditions: this.preconditions,
        });
    }
}

module.exports = { ServerUnmuteCommand };
