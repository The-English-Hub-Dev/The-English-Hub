const { Command, Args } = require('@sapphire/framework');
const { EmbedBuilder, Message, Colors } = require('discord.js');

class AvatarCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'avatar',
            aliases: ['av'],
            usage: '[user]',
            description: 'Shows the avatar of a user.',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const rawUser = await args.pickResult('user');

        const user = rawUser.unwrapOr(message.author);

        const av = user.displayAvatarURL({ size: 4096 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}'s Avatar`)
            .setImage(av)
            .setColor(Colors.Blurple)
            .setTimestamp()
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(),
            });

        return message.reply({ embeds: [embed] });
    }
}

module.exports = { AvatarCommand };
