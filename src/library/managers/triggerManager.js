const { DiscordInviteLinkRegex } = require('@sapphire/discord-utilities');
const { container } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { logChannel } = require('../../../config.json');

class TriggerManager {
    constructor() {}

    /**
     *
     * @param { Message } message
     */
    async runTriggersOnMessage(message) {
        let triggered = false;
        if (message.author.bot) return false;


        container.redis.lpush('hltriggers_vivek', )
        return triggered;
    }
}

module.exports = { TriggerManager };
