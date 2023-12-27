const { Listener, Events } = require('@sapphire/framework');
const { VoiceState, ChannelType, EmbedBuilder, Colors } = require('discord.js');
const {
    twoRoomsParentID,
    threeRoomsParentID,
    voiceStateLogChannelID,
} = require('../../../config.json');

class VoiceStateUpdateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            name: Events.VoiceStateUpdate,
            event: Events.VoiceStateUpdate,
        });
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async run(oldState, newState) {
        await this.logVoicestateChange(oldState, newState);
        // await this.handleRoomTwoCreation(oldState, newState);
        // await this.handleRoomThreeCreation(oldState, newState);
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async handleRoomTwoCreation(oldState, newState) {
        if (!newState.channelId) return;

        const twoRooms = oldState.guild.channels.cache
            .filter(
                (channel) =>
                    channel.parent &&
                    channel.type == ChannelType.GuildVoice &&
                    channel.parent.id === twoRoomsParentID
            )
            .sort((a, b) => a.position - b.position);

        if (newState.channel.id === twoRooms.last().id) {
            this.container.logger.info('Creating new room 2');
            const newChannel = await oldState.guild.channels.create({
                name: `Room 2.${
                    Number(twoRooms.last().name.split(' ')[1].split('.')[1]) + 1
                }`,
                type: ChannelType.GuildVoice,
                parent: twoRooms.last().parent,
                userLimit: 2,
                reason: 'New 2 room vc creation as all current rooms are full.',
            });
        }
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async handleRoomThreeCreation(oldState, newState) {
        if (!newState.channelId) return;

        const threeRooms = oldState.guild.channels.cache
            .filter(
                (channel) =>
                    channel.parent &&
                    channel.type == ChannelType.GuildVoice &&
                    channel.parent.id === threeRoomsParentID
            )
            .sort((a, b) => a.position - b.position);

        if (newState.channel.id === threeRooms.last().id) {
            this.container.logger.info('Creating new room 3');
            const newChannel = await oldState.guild.channels.create({
                name: `Room 3.${
                    Number(threeRooms.last().name.split(' ')[1].split('.')[1]) +
                    1
                }`,
                type: ChannelType.GuildVoice,
                parent: threeRooms.last().parent,
                userLimit: 3,
                reason: 'New 3 room vc creation as all current rooms are full.',
            });
        }
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async logVoicestateChange(oldState, newState) {
        const logEmbed = new EmbedBuilder();
        const voiceStateLogChannel = newState.guild.channels.cache.get(
            voiceStateLogChannelID
        );
        if (oldState.channelId && newState.channelId) {
            // member switched vcs
            logEmbed
                .setColor(Colors.DarkVividPink)
                .setTitle('Member switched voice channels')
                .addFields(
                    {
                        name: 'Member',
                        value: `${newState.member.user} (${newState.member.id})`,
                    },
                    {
                        name: 'Old Channel',
                        value: `${oldState.channel} (${oldState.channel.name} - ${oldState.channel.id})`,
                        inline: true,
                    },
                    {
                        name: 'New Channel',
                        value: `${newState.channel} (${newState.channel.name} - ${newState.channel.id})`,
                        inline: true,
                    },
                    {
                        name: 'New VC Members',
                        value: newState.channel.members
                            .map((member) => member.user)
                            .join(', '),
                    }
                )
                .setTimestamp();
        } else if (!oldState.channelId) {
            // member joined vc
            logEmbed
                .setColor(Colors.DarkGreen)
                .setTitle('Member joined voice channel')
                .addFields(
                    {
                        name: 'Member',
                        value: `${newState.member.user} (${newState.member.id})`,
                    },
                    {
                        name: 'Channel',
                        value: `${newState.channel} (${newState.channel.name} - ${newState.channel.id})`,
                    },
                    {
                        name: 'Status',
                        value: `${
                            newState.selfDeaf ? 'Deafened' : 'Not Deafened'
                        }, ${newState.selfMute ? 'Muted' : 'Unmuted'}, ${
                            newState.selfVideo
                                ? 'Video Enabled'
                                : 'Video Disabled'
                        }`,
                    },
                    {
                        name: 'VC Members',
                        value: newState.channel.members
                            .map((member) => member.user)
                            .join(', '),
                    }
                )
                .setTimestamp();
        } else if (!newState.channelId) {
            // member left vc
            logEmbed
                .setColor(Colors.DarkRed)
                .setTitle('Member left voice channel')
                .addFields(
                    {
                        name: 'Member',
                        value: `${oldState.member.user} (${oldState.member.id})`,
                    },
                    {
                        name: 'Channel',
                        value: `${oldState.channel} (${oldState.channel.name} - ${oldState.channel.id})`,
                    },
                    {
                        name: 'VC Members',
                        value: newState.channel.members
                            .map((member) => member.user)
                            .join(', '),
                    }
                )
                .setTimestamp();
        }
        return voiceStateLogChannel.send({ embeds: [logEmbed] });
    }
}

module.exports = { VoiceStateUpdateListener };
