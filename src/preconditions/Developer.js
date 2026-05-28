const { Precondition } = require('@sapphire/framework');
const { Message } = require('discord.js');

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
        // SECURITY FIX: Removed testing server bypass - this allowed anyone in the test guild to be a developer
        // Only the actual application owner(s) can execute developer commands, regardless of guild
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
