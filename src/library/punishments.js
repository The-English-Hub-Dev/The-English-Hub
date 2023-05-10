const { time, TimestampStyles } = require('@discordjs/builders');
const {
    GuildMember,
    User,
    Guild,
    EmbedBuilder,
    Message,
} = require('discord.js');
const { Punishment } = require('./db/entities/PunishmentEntity');
const { PunishmentType } = require('./typings');

class Punishments {
    /**
     *
     * @param { GuildMember | User } member
     * @param { Guild } guild
     * @param { PunishmentType } type
     */
    async sendPunishmentEmbed(member, guild, type) {
        const embed = new EmbedBuilder()
            .setColor(await this.getPunishmentColor(type))
            .setTitle(await this.getTitle(type))
            .addFields({
                name: 'Time',
                value: time(new Date(), TimestampStyles.LongDateTime),
                inline: true,
            });

        return embed;
    }

    /**
     *
     * @param { GuildMember } member
     * @param { Punishment } punishment
     * @param { PunishmentType } type
     */
    async getChatPunishmentEmbed(member, punishment, type) {
        return new EmbedBuilder().setDescription('not ready'); // TODO
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
    async getTitle(type) {}
}

module.exports = { Punishments };
