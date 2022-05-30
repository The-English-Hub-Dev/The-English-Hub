const { time, TimestampStyles } = require("@discordjs/builders");
const { GuildMember, User, Guild, MessageEmbed, Message } = require("discord.js");
const { PunishmentType } = require("./typings");

class Punishments {
	/**
	 * 
	 * @param { GuildMember | User } member 
	 * @param { Guild } guild 
	 * @param { PunishmentType } type 
	 */
	async sendPunishmentEmbed(member, guild, type) {
		const embed = new MessageEmbed()
			.setColor(await this.getPunishmentColor(type))
			.setTitle(await this.getTitle(type))
			.addField("Time", time(new Date(), TimestampStyles.LongDateTime), true)
		
		return embed;
	}

	/**
	 * 
	 * @param { GuildMember } member 
	 * @param { PunishmentType } type 
	 */
	async getChatPunishmentEmbed(member, type) {
		return new MessageEmbed().setDescription('not ready'); // TODO
	}

	/**
	 * 
	 * @param { PunishmentType } type 
	 */
	async getPunishmentColor(type) {
		switch (type) {
			case PunishmentType.WARN:
				
				break;
			case PunishmentType.MUTE:

				break;
			case PunishmentType.UNMUTE:

				break;
			case PunishmentType.KICK:

				break;
			case PunishmentType.BAN:

				break;
			case PunishmentType.UNBAN:

				break;
			default:
				break;
		}
	}

	/**
	 * 
	 */
	async getTitle(type) {

	}
}

module.exports = { Punishments };