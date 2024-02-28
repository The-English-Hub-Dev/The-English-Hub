const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { staffRoles, testingServerID } = require('../../config.json');

class StaffBanPermsPrecondition extends Precondition {
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
                    .get('Admin')
                    .messageRun(message)
            ).isOk()
        )
            return this.ok();

        return message.member.roles.cache.has('1040897095055458344')
            ? this.ok()
            : this.error(); // crew mate role OR ADMIN
    }
}
module.exports = { StaffBanPermsPrecondition };
