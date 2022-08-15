const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');

class AdminPrecondition extends Precondition {
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
        return this.error();
    }
}
module.exports = { AdminPrecondition };
