const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { premiumMemberRoleID } = require('../../config.json');

class PremiumMemberPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (message.member.roles.cache.has(premiumMemberRoleID))
            return this.ok();

        return this.error();
    }
}
module.exports = { PremiumMemberPrecondition };
