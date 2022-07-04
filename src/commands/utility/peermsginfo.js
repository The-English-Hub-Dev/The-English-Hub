const { Command, Args } = require('@sapphire/framework');
const { Message, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

class PeerMsgInfoCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'peermsginfo',
            aliases: ['peermessageinfo'],
            description: 'Sends the peer message embed in the specified channel(or the current one)',
            preconditions: ['Admin'],
        });
    }

	/**
	 * 
	 * @param { Message } message 
	 * @param { Args } args
	 */
	async messageRun(message, args) {
		const rawCh = await args.pickResult('guildTextChannel');

		const channel = rawCh.value ?? message.channel;
		if (channel.type !== 'GUILD_TEXT') return message.reply('An error occured.');

		const components = new MessageActionRow().addComponents(
			new MessageButton()
				.setLabel("Send a message!")
				.setCustomId('peer-request')
				.setStyle('PRIMARY')
		);

		const embed = new MessageEmbed()
			.setTitle("Send a message to another member in the server")
			.setDescription(`Click the button below if you would like to send a message to another member.
							 It will prompt you for their ID and then the message you would like to send.
							 After entering this information, the message will be sent to the staff to be approved. If it is approved,
							 It will then be sent to the member you requested it to be sent to`)
			.setColor('#FF69B4')
			.setFooter({text: message.guild.name, iconURL: message.guild.iconURL()});
		
		await channel.send({embeds: [embed], components: [components]}).catch(() => { return message.reply(`There was an error sending the peer message information in ${channel}`) });

		return message.reply(`Successfully send the peer message information to ${channel}`);
	}
}

module.exports = { PeerMsgInfoCommand };