const { Listener, Events, Args, MessageCommandContext } = require('@sapphire/framework');
const { Message, MessageEmbed } = require('discord.js');
const { redirectDMChannelID, mainGuildID } = require('../../../config.json');

class MessageCreateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            name: Events.MessageCreate,
            event: Events.MessageCreate,
        });
    }

    /**
     *
     * @param { Message } message
     */
    async run(message) {
        if (message.channel.type === 'DM') {
            return this.redirectDM(message);
        }
    }

    /**
     * 
     * @param { Message } message 
     * @param { Args } _args
     * @param { MessageCommandContext } ctx
     */
    async redirectDM(message, _args, ctx) {
        const redirCh = this.container.client.guilds.cache.get(mainGuildID).channels.cache.get(redirectDMChannelID);
        
        if (!redirCh || redirCh.type !== 'GUILD_TEXT') return;

        const embed = new MessageEmbed()
            .setTitle(`I recieved a DM from ${message.author.tag}`)
            .setColor('RANDOM')
            .setDescription(`DM recieved: ${message.content}`)
            .setFooter({text: `You can reply to this DM by using the ${ctx.commandPrefix}dm command`});
        return redirCh.send({embeds: [embed]});
    }
}

module.exports = { MessageCreateListener };
