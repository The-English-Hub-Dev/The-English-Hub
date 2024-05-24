const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    Colors,
    GuildMember,
    ChannelType,
    time,
    TimestampStyles,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const { DiscordSnowflake } = require('@sapphire/snowflake');
const { Duration } = require('@sapphire/time-utilities');

class GiveawaycreateCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'giveawaycreate',
            aliases: ['gwcreate', 'gcreate'],
            description: 'Creates a giveaway.',
            usage: '<duration> <winners> <prize>',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const giveawayID = DiscordSnowflake.generate();
        const rawDuration = await args.pickResult('string');
        if (rawDuration.isErr())
            return this.container.utility.errReply(
                message,
                'You need to provide a duration for the giveaway.'
            );
        const duration = new Duration(rawDuration.unwrap());
        if (isNaN(duration.offset))
            return this.container.utility.errReply(
                message,
                'Invalid duration provided.'
            );
        const gwEndDate = new Date(Date.now() + duration.offset);

        const rawWinners = await args.pickResult('number');
        if (rawWinners.isErr())
            return this.container.utility.errReply(
                message,
                'You need to provide a valid number of winners for the giveaway.'
            );

        const gwPrize = await args.restResult('string');
        if (gwPrize.isErr())
            return this.container.utility.errReply(
                message,
                'You need to provide a prize for the giveaway.'
            );

        const gwEmbed = new EmbedBuilder()
            .setTitle('🎉 Giveaway')
            .setDescription(
                `**Prize: ${gwPrize.unwrap()}**\nEnds in ${time(gwEndDate, TimestampStyles.RelativeTime)}\n*Giveaway ID: ${giveawayID}*\n\nCurrent Entries: 0`
            )
            .setColor(Colors.DarkGreen)
            .setFooter({
                text: `Hosted by ${message.author.tag} - ${message.guild.name}`,
                iconURL: message.guild.iconURL(),
            });

        const gwButtonActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId(`gw_enter:${giveawayID}`)
                .setLabel('Join Giveaway')
                .setStyle(ButtonStyle.Primary),
        ]);

        return message.channel.send({
            embeds: [gwEmbed],
            components: [gwButtonActionRow],
        });
    }
}

module.exports = { GiveawaycreateCommand };
