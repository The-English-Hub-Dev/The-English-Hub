const { Listener, Events } = require('@sapphire/framework');
const { VoiceState, GuildMember } = require('discord.js');
const { smallRoomCreateVC } = require('../../../config.json');

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
     * @param { VoiceState } oldVS
     * @param { VoiceState } newVS
     */
    async run(oldVS, newVS) {
        if (!oldVS.channel && newVS.channel.id === smallRoomCreateVC) {
            await this.handleSmallRoomCreate(newVS.member);
        }

        if (oldVS.channel && oldVS.name.startsWith('Small Room') && !newVS) {
            await this.handleInactiveRoomDeletion(oldVS);
        }
    }

    /**
     *
     * @param { GuildMember } member
     */
    async handleSmallRoomCreate(member) {
        const currentSmallRooms = member.guild.channels.cache
            .filter((ch) => ch.name.startsWith('Small Room'))
            .sort(
                (ch1, ch2) =>
                    ch1.name[ch1.name.length] - ch2.name[ch2.name.length]
            );
        const lastRoom = currentSmallRooms.last();
        if (lastRoom.name.endsWith('20')) return; // max small room channel limit
        const newSmallVC = member.guild.channels.create(
            `Small Room ${Number(lastRoom.name[lastRoom.name.length]) + 1}`,
            {
                userLimit: 2,
                reason: 'Creating a new small VC',
            }
        );

        return member.voice.setChannel(newSmallVC);
    }

    /**
     *
     * @param { VoiceState } oldVS
     */
    async handleInactiveRoomDeletion(oldVS) {
        if (!oldVS.channel.members.size && oldVS.channel.deletable) {
            await oldVS.channel.delete('Inactive Small Room');
        }
    }
}

module.exports = { VoiceStateUpdateListener };
