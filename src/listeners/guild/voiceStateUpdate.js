const { Listener, Events } = require('@sapphire/framework');
const { VoiceState, ChannelType } = require('discord.js');
const {
    twoRoomsParentID,
    threeRoomsParentID,
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
        await this.handleRoomTwoCreation(oldState, newState);
        await this.handleRoomThreeCreation(oldState, newState);
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
}

module.exports = { VoiceStateUpdateListener };
