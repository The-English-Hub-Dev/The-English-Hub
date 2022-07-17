const { Command, Args } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');

class MovemeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'moveme',
            aliases: ['movemevc'],
            description: 'Moves you into a certain voice channel.',
            preconditions: ['Staff'],
        });
    }

	/**
	 * 
	 * @param { Message } message 
	 * @param { Args } args
	 */
	async messageRun(message, args) {
		const vc = await args.pickResult('guildVoiceChannel');
		if (!vc.success) return this.container.utility.errReply(message, 'You must provide a valid voice channel to be moved into.');

		if (!message.member.voice.channel) return this.container.utility.errReply(message, 'You must be in a voice channel to use this command.');

		if (!message.member.permissionsIn(vc.value).has(Permissions.FLAGS.VIEW_CHANNEL)) return this.container.utility.errReply(message, 'You cannot move yourself to that channel.');
		await message.member.voice.setChannel(vc.value, 'Requested to be moved with the moveme command.').catch(() => {});

		return message.reply(`You have been successfully moved to ${vc.value}`)
	}
}

module.exports = { MovemeCommand }