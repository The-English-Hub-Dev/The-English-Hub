const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { staffRoles, testingServerID } = require('../../config.json');

class StaffPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return this.ok();
        if (
            !(
                await this.container.stores
                    .get('preconditions')
                    .get('Developer')
                    .messageRun(message)
            ).isErr()
        )
            return this.ok();

        return staffRoles.some((role) => message.member.roles.cache.has(role))
            ? this.ok()
            : this.error();
    }
}
module.exports = { StaffPrecondition };
