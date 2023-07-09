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
        if (await container.utility.isStaff(message)) {
            container.logger.info('isStaff returned true')
            container.logger.warn('skipping because testing')
            // return true;
        }
        msgOk = await this.discordInviteCheck(message);
        container.logger.info('discordInviteCheck returned ' + msgOk)

        return msgOk;
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async discordInviteCheck(message) {
        container.logger.info('running discord invite check')
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
