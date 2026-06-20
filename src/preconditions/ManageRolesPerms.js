const { Precondition } = require('@sapphire/framework');
const { Message, PermissionFlagsBits } = require('discord.js');

class ManageRolesPermsPrecondition extends Precondition {
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

        return message.member.permissions.has(PermissionFlagsBits.ManageRoles)
            ? this.ok()
            : this.error({
                  message:
                      'You need the Manage Roles permission to use this command.',
              });
    }
}
module.exports = { ManageRolesPermsPrecondition };
