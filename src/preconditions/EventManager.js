const { Precondition } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { eventManagerRoles } = require('../../config.json');

class EventManagerPrecondition extends Precondition {
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

        if (eventManagerRoles.some((r) => message.member.roles.cache.has(r)))
            return this.ok();

        return this.error();
    }
}
module.exports = { EventManagerPrecondition };
