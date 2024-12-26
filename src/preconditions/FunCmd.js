const { Precondition } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { funCmdRoles } = require('../../config.json');

class FunCmdPrecondition extends Precondition {
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

        return funCmdRoles.some((role) => message.member.roles.cache.has(role))
            ? this.ok()
            : this.error();
    }
}
module.exports = { FunCmdPrecondition };
