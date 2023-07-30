const { Listener, Events } = require('@sapphire/framework');
const { VoiceState, ChannelType } = require('discord.js');
const { smallRoomParentID } = require('../../../config.json');

class GuildMemberAddListener extends Listener {
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
        this.container.logger.info('VoiceStateUpdate event fired');
        this.container.logger.info('oldState');
        this.container.logger.info(oldState);
        this.container.logger.info('newState');
        this.container.logger.info(newState);
        await this.handleRoomTwoCreation(oldState, newState);
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async handleRoomTwoCreation(oldState, newState) {
        const twoRooms = oldState.guild.channels.cache.filter(
            (channel) =>
                channel.parent &&
                channel.type == ChannelType.GuildVoice &&
                channel.parent.id === smallRoomParentID
        );

        if (!oldState.channel && newState.channel.id === twoRooms.last().id) {
            const newChannel = await oldState.guild.channels.create({
                name: `Room 2.${
                    Number(twoRooms.last().name.split(' ')[1].split('.')) + 1
                }`,
                type: ChannelType.GuildVoice,
                parent: twoRooms.last().parent,
                userLimit: 2,
                reason: 'New 2 room vc creation as all current rooms are full.',
            });
        }
    }
}

module.exports = { GuildMemberAddListener };
