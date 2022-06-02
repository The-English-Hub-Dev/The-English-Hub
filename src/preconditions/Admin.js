const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');

class AdminPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    messageRun(message) {
        if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return this.ok();
        return this.error();
    }
}
module.exports = { AdminPrecondition };
