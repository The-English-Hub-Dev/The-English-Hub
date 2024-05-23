const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    GuildMember,
    ChannelType,
} = require('discord.js');
const { logChannelID } = require('../../../config.json');

class GiveawaycreateCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'dm',
            aliases: ['dmmember'],
            description:
                'DMs a member in the server with a specified message. You can also include attachments by attaching them to your dm command.',
            usage: '<member> <message>',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        
    }

}

module.exports = { GiveawaycreateCommand };
