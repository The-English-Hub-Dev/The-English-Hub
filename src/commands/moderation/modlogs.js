const { time, TimestampStyles, blockQuote } = require('@discordjs/builders');
const { Command, Args } = require('@sapphire/framework');
const { Message, EmbedBuilder, Colors } = require('discord.js');
const { staffRoles } = require('../../../config.json');

class ModlogsCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'modlogs',
            aliases: ['warnings', 'warns', 'infractions', 'punishments'],
            description: 'View all the modlogs of a user.',
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
                .setTitle(`Showing all punishments for ${user.tag}`)
                .setDescription(
                    `${punishments.length} punishments found for ${user}.`
                )
                .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                .setColor(Colors.Red);

            const warnsEmbedFields = [];
            for (var i = 0; i < punishments.length; ++i) {
                const punishment = punishments[i];
                const moderator = await this.container.client.users.fetch(
                    punishment.moderator_id
                );
                warnsEmbedFields.push({
                    name: punishment.punishment_id,
                    value: blockQuote(
                        `**Type:** ${punishment.type}\n**Reason:** ${
                            punishment.reason
                        }\n**Moderator:** ${moderator.tag}\n**Date:** ${time(
                            punishment.timestamp,
                            TimestampStyles.LongDateTime
                        )}\n**Expiration:** <t:${Math.round(
                            punishment.expiration / 1000
                        )}:F>`
                    ),
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
                .setTitle(`Showing all punishments for ${user.tag}`)
                .setDescription(
                    `${punishments.length} punishments found for ${user}.`
                )
                .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
                .setColor('#73af96');

            const warnsEmbedFields = [];
            for (var x = 0; x < punishments.length; ++x) {
                const punishment = punishments[x];
                warnsEmbedFields.addField({
                    name: punishment.punishment_id,
                    value: blockQuote(
                        `**Type:** ${punishment.type}\n**Reason:** ${
                            punishment.reason
                        }\n**Date:** ${time(
                            punishment.timestamp,
                            TimestampStyles.LongDateTime
                        )}\n**Expiration:** <t:${Math.round(
                            punishment.expiration / 1000
                        )}:F>`
                    ),
                });
            }
            warnsEmbed.addFields(warnsEmbedFields);

            return message.reply({ embeds: [warnsEmbed] });
        }
    }
}

module.exports = { ModlogsCommand };
