const { Command } = require('@sapphire/framework');

class ViewVivekTriggersCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'viewvivektriggers',
            aliases: ['viewvivekhighlights'],
            description:
                "View vivek's highlight triggers that will send a dm to him when mentioned",
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        const triggers = await this.container.redis.lrange(
            'hltriggers_vivek',
            0,
            -1
        );
        if (triggers.length === 0) {
            return message.reply("There are no triggers for Vivek's highlight");
        }

        return message.reply(
            `The current triggers for Vivek's highlight are: ${triggers.join(
                ', '
            )}`
        );
    }
}

module.exports = { ViewVivekTriggersCommand };
