const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class SendButtonRoleEmbedsCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'sendbuttonroleembeds',
            aliases: ['sendbtnroleembeds'],
            description: 'Sends the embeds for button roles',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const channel =
            (await args.pickResult('guildTextChannel')).value ??
            message.channel;
		
		
    }
}
