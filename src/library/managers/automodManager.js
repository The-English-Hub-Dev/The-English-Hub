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
        msgOk = await this.walltextCheck(message);
        container.logger.info('walltextCheck returned ' + msgOk)

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
            if (message.deletable) await message.delete();
            const reply = await message.channel.send(
                `${message.author}, you are not allowed to send invite links in this server.`
            );
            setTimeout(() => reply.delete(), 3500);
            return false;
        }
        return true;
    }

    /**
     * 
     * @param { Message } message 
     */
    async walltextCheck(message) {
        const messageLines = message.content.split('\n');
        if (messageLines.length > 15 || message.content.length > 2000) {
            if (message.deletable) await message.delete();
            const reply = await message.channel.send(`${message.author}, your message is too many lines/too long and spams the chat. Please shorten it.`);
            setTimeout(() => reply.delete(), 3500);
            return false;
        }
        return true;
    }
}

module.exports = { AutomodManager };
