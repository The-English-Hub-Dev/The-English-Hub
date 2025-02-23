const { Command, Args } = require('@sapphire/framework');
class RemoveVivekTriggerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'removevivektrigger',
            aliases: ['removevivekhighlight'],
            description: "Removes a word from vivek's highlight triggers",
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const trigger = await args.restResult('string');
        if (trigger.isErr()) {
            return this.container.utility.errReply(
                message,
                'You must provide a word to remove to the highlight triggers'
            );
        }

        await this.container.redis.lrem(
            'hltriggers_vivek',
            1,
            trigger.unwrap()
        );

        return message.reply(
            `Successfully removed \`${trigger.unwrap()}\` from the highlight triggers for Vivek`
        );
    }
}

module.exports = { RemoveVivekTriggerCommand };
