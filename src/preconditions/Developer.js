const { Precondition } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { testingServerID } = require('../../config.json');

class DeveloperPrecondition extends Precondition {
    async fetchApplicationWithTimeout(timeoutMs = 5000) {
        await Promise.race([
            this.container.client.application.fetch(),
            new Promise((_, reject) => {
                setTimeout(
                    () => reject(new Error('Application fetch timed out')),
                    timeoutMs
                );
            }),
        ]);
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (message.guild.id === testingServerID) return this.ok();
        if (!this.container.client.application.owner)
            await this.fetchApplicationWithTimeout();
        return this.container.client.application.owner.members.has(
            message.author.id
        )
            ? this.ok()
            : this.error('User is not a developer');
    }
}

module.exports = { DeveloperPrecondition };
