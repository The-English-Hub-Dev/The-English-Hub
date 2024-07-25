const { Message, VoiceState } = require('discord.js');
const { container } = require('@sapphire/framework');

class LevelManager {
    constructor() {}

    /**
     *
     * @param { Message } message
     */
    async onMessage(message) {
        container.db;
    }

    /**
     *
     * @param { VoiceState } oldVoice
     * @param { VoiceState } newVoice
     */
    async onVoiceJoin(oldVoice, newVoice) {}

    /**
     *
     * @param { VoiceState } oldVoice
     * @param { VoiceState } newVoice
     */
    async onVoiceLeave(oldVoice, newVoice) {}
}

module.exports = { LevelManager };
