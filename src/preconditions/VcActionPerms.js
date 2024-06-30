const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { vcActionPerms, testingServerID } = require('../../config.json');

class VcActionPermsPrecondition extends Precondition {
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

        return vcActionPerms.some((role) =>
            message.member.roles.cache.has(role)
        )
            ? this.ok()
            : this.error();
    }
}
module.exports = { VcActionPermsPrecondition };
