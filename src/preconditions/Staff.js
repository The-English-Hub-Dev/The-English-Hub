const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { staffRoles, testingServerID } = require('../../config.json');

class StaffPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    messageRun(message) {
        if (message.guild.id === testingServerID) return this.ok(); // return ok if testing server
        if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return this.ok();
        return staffRoles.some((role) => message.member.roles.cache.has(role))
            ? this.ok()
            : this.error('User is not a staff member');
    }
}
module.exports = { StaffPrecondition };
