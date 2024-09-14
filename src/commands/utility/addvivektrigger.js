const { Command, Args } = require('@sapphire/framework');

class AddVivekTriggerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'addvivektrigger',
            aliases: ['addvivekhighlight'],
            description:
                "Adds a word to vivek's highlight triggers that will send vivek a dm when mentioned",
            usage: '<trigger>',
            preconditions: ['NotOrigCmdChannel', 'Admin'],
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
                'You must provide a word to add to the highlight triggers'
            );
        }

        await this.container.redis.lpush('hltriggers_vivek', trigger.unwrap());

        return message.reply(
            `Successfully added \`${trigger.unwrap()}\` to the highlight triggers for Vivek`
        );
    }
}

module.exports = { AddVivekTriggerCommand };
