const { Listener, Events } = require('@sapphire/framework');
const { VoiceState } = require('discord.js');

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
    }
}

module.exports = { GuildMemberAddListener };
