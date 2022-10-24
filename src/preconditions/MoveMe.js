const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { moveMeRoles } = require('../../config.json');

class StaffPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('Staff')
                    .messageRun(message)
            ).isOk()
        )
            return this.ok();
        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('PremiumMember')
                    .messageRun(message)
            ).isOk()
        )
            return this.ok();

        return moveMeRoles.some((role) => message.member.roles.cache.has(role))
            ? this.ok()
            : this.error();
    }
}
module.exports = { StaffPrecondition };
