const { Precondition } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { testingServerID } = require('../../config.json');

class DeveloperPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (message.guild.id === testingServerID) return this.ok();
        if (!this.container.client.application.owner.members)
            await this.container.client.application.fetch();
        return this.container.client.application.owner.members.has(
            message.author.id
        )
            ? this.ok()
            : this.error('User is not a developer');
    }
}

module.exports = { DeveloperPrecondition };
