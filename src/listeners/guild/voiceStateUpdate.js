const { Listener, Events } = require('@sapphire/framework');
const { VoiceState, GuildMember } = require('discord.js');
const { smallRoomVC1 } = require('../../../config.json');

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
        if (oldVS.channel === null && newVS.channel.id === smallRoomVC1) {
            await this.handleSmallRoomVC(newVS.member);
        }
    }

    /**
     *
     * @param { GuildMember } member
     */
    async handleSmallRoomVC(member) {
        const currentSmallRooms = member.guild.channels.cache
            .filter((ch) => ch.name.startsWith('Small Room'))
            .sort(
                (ch1, ch2) =>
                    ch1.name[ch1.name.length] - ch2.name[ch2.name.length]
            );
        const lastRoom = currentSmallRooms.last();
        if (lastRoom.name.endsWith('20')) return; // max small room channel limit
        const newSmallVC = member.guild.channels.create(
            `Small Room ${Number(lastRoom.name[lastRoom.name.length]) + 1}`
        );

        await member.voice.setChannel(newSmallVC);
    }
}

module.exports = { VoiceStateUpdateListener };
