const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Command, Args } = require('@sapphire/framework');
const { Message } = require('discord.js');

class RemovepunishmentCommand extends Command {
	/**
	 * 
	 * @param { Command.Context } context 
	 * @param {Command.Options} options 
	 */
	constructor(context, options) {
		super(context, {
			...options,
			name: 'removepunishment',
			description: 'Removes a punishment from a user.',
			preconditions: ['Staff'],
		})
	}

	/**
	 * 
	 * @param { Message } message 
	 * @param { Args } args
	 */
	async messageRun(message, args) {
		const rawID = await args.pickResult('string');
		const reason = await args.restResult('string');

		if (!rawID.success) return this.container.utility.errReply(message, 'You must provide a valid punishment ID to remove.');
		if (!reason.success) return this.container.utility.errReply(message, 'You must provide a reason to remove the punishment.');

		const id = rawID.value;
		const punishment = await this.container.db.punishments.findOneBy({punishment_id: id});

		if (!punishment) return this.container.utility.errReply(message, 'That punishment ID does not exist.');
		
		const prompter = new MessagePrompter(`Are you sure you want to remove punishment ${id}?`)
		const answer = await prompter.run(message.channel, message.author);

		if (!answer) return message.reply('Canceled');

		await this.container.db.punishments.remove(punishment);

		return message.reply(`Removed punishment \`${id}\``);
	}
}

module.exports = { RemovepunishmentCommand };