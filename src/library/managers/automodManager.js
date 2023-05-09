const { DiscordInviteLinkRegex } = require('@sapphire/discord-utilities');
const { container } = require('@sapphire/framework');
const { Message } = require('discord.js');

class AutomodManager {
    constructor() {}

    /**
     *
     * @param { Message } message
     */
    async runAutomodOnMessage(message) {
        let msgOk = true;
        if (await container.utility.isStaff(message)) return true;
        while (msgOk) msgOk = await this.discordInviteCheck(message);

        return msgOk;
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async discordInviteCheck(message) {
        const inviteLink = DiscordInviteLinkRegex.exec(message.content);
        if (inviteLink && inviteLink[0] !== 'discord.gg/enghub') {
            message.delete();
            const reply = await message.channel.send(
                `${message.author}, you are not allowed to send invite links in this server.`
            );
            setTimeout(() => reply.delete(), 3500);
            return false;
        }
        return true;
    }
}

module.exports = { AutomodManager };
