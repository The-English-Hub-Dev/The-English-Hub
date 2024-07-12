const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { vcActionPerms, testingServerID } = require('../../config.json');

class VcMutePermsPrecondition extends Precondition {
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

        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('Staff')
                    .messageRun(message)
            ).isOk()
        )
            return this.ok();

        return vcActionPerms.some(
            (role) =>
                message.member.roles.cache.has(role) &&
                role.id !== '1234252770035630162' &&
                role.id !== '1230247967626104913'
        )
            ? this.ok()
            : this.error();
    }
}
module.exports = { VcMutePermsPrecondition };
