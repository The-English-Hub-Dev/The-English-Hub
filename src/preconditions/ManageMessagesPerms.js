const { Precondition } = require('@sapphire/framework');
const { Message, PermissionFlagsBits } = require('discord.js');

class ManageMessagesPermsPrecondition extends Precondition {
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

        return message.member.permissions.has(
            PermissionFlagsBits.ManageMessages
        )
            ? this.ok()
            : this.error({
                  message:
                      'You need the Manage Messages permission to use this command.',
              });
    }
}
module.exports = { ManageMessagesPermsPrecondition };
