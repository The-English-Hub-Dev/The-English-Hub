const { Command, Args } = require('@sapphire/framework');
const { EmbedBuilder, Message, Colors } = require('discord.js');

class AvatarCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'avatar',
            aliases: ['av'],
            description: 'Shows the avatar of a user',
        });
    }

	/**
	 * 
	 * @param { Message } message 
	 * @param { Args } args 
	 * @returns 
	 */
    async messageRun(message, args) {
		const user = await args.pickResult('user');
		if (user.isErr()) return this.container.utility.errReply(message, 'You must provide a valid user to get the avatar of.');

		const av = user.unwrap().displayAvatarURL({size: 4096});

		const embed = new EmbedBuilder()
			.setTitle(`${user.unwrap().tag}'s Avatar`)
			.setImage(av)
			.setColor(Colors.Blurple)
			.setTimestamp()
			.setFooter({text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL()});

		return message.reply({embeds: [embed]});
    }
}

module.exports = { AvatarCommand };
