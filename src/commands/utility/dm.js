const { Command, Args } = require('@sapphire/framework');
const { Message, MessageEmbed } = require('discord.js');

class DmCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'dm',
            aliases: ['dmmember'],
            description: 'DMs a member in the server with a specified message',
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawMember = await args.pickResult('member');
        if (!rawMember.success)
            return this.container.utility.errReply(
                message,
                'You must provide a valid member to send a DM to.'
            );

        const msg = await args.restResult('string');
        if (!msg.success)
            return this.container.utility.errReply(
                message,
                'You must provide a message to send to the member.'
            );
        if (msg.value.length > 1000)
            return this.container.utility.errReply(
                message,
                'The message length may not be greater than 1000 characters.'
            );

        const member = rawMember.value;

        const dmEmbed = new MessageEmbed()
            .setDescription(`**Message:** ${msg.value}`)
            .setFooter({ text: `Sent from ${message.guild.name}` })
            .setColor('BLUE');

        const successful = await member
            .send({ embeds: [dmEmbed] })
            .catch(() => null);
        if (!successful)
            return message.reply(
                `Couldn't send the message to that user. They most likely have their DM's closed.`
            );
        return message.reply(`Successfully sent DM to ${member.user.tag}.`);
    }
}

module.exports = { DmCommand };
