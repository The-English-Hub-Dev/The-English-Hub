const { Command, Args } = require('@sapphire/framework');

class RemoveVivekTriggerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'removeservermessagetrigger',
            aliases: [
                'removemessagetrigger',
                'removetrigger',
                'removeservertrigger',
            ],
            description:
                "removes a trigger and the corresponding response from the server's message triggers",
            preconditions: ['Admin'],
            usage: `<trigger>`,
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
        if (trigger.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a valid trigger to remove.'
            );
        if (
            !(await this.container.redis.hget(
                `guildtriggers_${message.guild.id}`,
                trigger.unwrap()
            ))
        )
            return this.container.utility.errReply(
                message,
                'That trigger does not exist in this server.'
            );

        await this.container.redis.hdel(
            `guildtriggers_${message.guild.id}`,
            trigger.unwrap()
        );

        return message.reply(
            `Successfully removed \`${trigger.unwrap()}\` from the list of message triggers.`
        );
    }
}

module.exports = { RemoveVivekTriggerCommand };
