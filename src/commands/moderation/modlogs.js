const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    time,
    TimestampStyles,
    blockQuote,
} = require('discord.js');
const { staffRoles } = require('../../../config.json');

class ModlogsCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'modlogs',
            aliases: ['warnings', 'warns', 'infractions', 'punishments'],
            description: 'View all the modlogs of a user.',
            usage: '<user>',
            preconditions: ['CmdCh'],
        });
    }

    /**
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('Staff')
                    .messageRun(message)
            ).isOk()
        ) {
            const user = (await args.pickResult('user')).unwrapOr(
                message.author
            );
            const punishments = await this.container.db.punishments.findBy({
                user_id: user.id,
            });

            if (!punishments.length) {
                if (user.id === message.author.id) {
                    return message.reply('You have no punishments.');
                }
                return message.reply(`\`${user.tag}\` has no punishments.`);
            }

            const warnsEmbed = new EmbedBuilder()
                .setTitle(`Punishments for ${user.tag}`)
                .setDescription(
                    `${punishments.length} punishments found for ${user}.`
                )
                .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                .setColor(Colors.LuminousVividPink);

            const uniqueModeratorIds = [
                ...new Set(punishments.map((p) => p.moderator_id)),
            ];
            const moderatorCache = new Map(
                await Promise.all(
                    uniqueModeratorIds.map(async (id) => {
                        const moderator = await this.container.client.users
                            .fetch(id)
                            .catch(() => null);
                        return [id, moderator];
                    })
                )
            );

            const warnsEmbedFields = [];
            for (let i = 0; i < punishments.length && i < 25; ++i) {
                const punishment = punishments[i];
                const moderator = moderatorCache.get(punishment.moderator_id);
                const moderatorTag = moderator?.tag || punishment.moderator_id;
                warnsEmbedFields.push({
                    name: `Punishment ID: ${punishment.punishment_id} | Moderator: ${moderatorTag}`,
                    value: blockQuote(
                        `**Type:** ${punishment.type}\n**Reason:** ${
                            punishment.reason
                        }\n**Date:** ${time(
                            punishment.timestamp,
                            TimestampStyles.LongDateTime
                        )}\n**Expiration:** ${
                            punishment.expiration
                                ? time(
                                      punishment.expiration,
                                      TimestampStyles.LongDateTime
                                  )
                                : 'Never'
                        }`
                    ),
                });
            }

            if (punishments.length > 25) {
                warnsEmbedFields.push({
                    name: 'Results truncated',
                    value: `Showing first 25 of ${punishments.length} punishments.`,
                });
            }
            warnsEmbed.addFields(warnsEmbedFields);

            return message.reply({ embeds: [warnsEmbed] });
        } else {
            const user = message.author;
            const punishments = await this.container.db.punishments.findBy({
                user_id: user.id,
            });

            if (!punishments.length) {
                return message.reply('You have no punishments.');
            }

            const warnsEmbed = new EmbedBuilder()
                .setTitle(`Punishments for ${user.tag}`)
                .setDescription(
                    `${punishments.length} punishments found for ${user}.`
                )
                .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                .setColor(Colors.LuminousVividPink);

            const warnsEmbedFields = [];
            for (let x = 0; x < punishments.length && x < 25; ++x) {
                const punishment = punishments[x];
                warnsEmbedFields.push({
                    name: punishment.punishment_id,
                    value: blockQuote(
                        `**Type:** ${punishment.type}\n**Reason:** ${
                            punishment.reason
                        }\n**Date:** ${time(
                            punishment.timestamp,
                            TimestampStyles.LongDateTime
                        )}\n**Expiration:** ${
                            punishment.expiration
                                ? time(
                                      punishment.expiration,
                                      TimestampStyles.LongDateTime
                                  )
                                : 'Never'
                        }`
                    ),
                });
            }

            if (punishments.length > 25) {
                warnsEmbedFields.push({
                    name: 'Results truncated',
                    value: `Showing first 25 of ${punishments.length} punishments.`,
                });
            }
            warnsEmbed.addFields(warnsEmbedFields);

            return message.reply({ embeds: [warnsEmbed] });
        }
    }
}

module.exports = { ModlogsCommand };
