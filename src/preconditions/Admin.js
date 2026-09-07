const { Precondition } = require('@sapphire/framework');
const { Message, PermissionFlagsBits } = require('discord.js');

class AdminPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (message.member.permissions.has(PermissionFlagsBits.Administrator))
            return this.ok();

        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('Developer')
                    .messageRun(message)
            ).isOk()
        )
            return this.ok();
        return this.error();
    }

    async chatInputRun(interaction) {
        if (interaction.member.permissions.has(PermissionFlagsBits.Administrator))
            return this.ok();

        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('Developer')
                    .chatInputRun(interaction)
            ).isOk()
        )
            return this.ok();
        return this.error();
    }
}
module.exports = { AdminPrecondition };
