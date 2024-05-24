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
} = require('discord.js');
const { DiscordSnowflake } = require('@sapphire/snowflake');
const { Duration } = require('@sapphire/time-utilities');

class GiveawaycreateCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'dm',
            aliases: ['dmmember'],
            description:
                'DMs a member in the server with a specified message. You can also include attachments by attaching them to your dm command.',
            usage: '<member> <message>',
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
                `**Prize: ${gwPrize.unwrap()}**\nEnds in ${time(gwEndDate, TimestampStyles.RelativeTime)}\\*Giveaway ID: ${giveawayID}*`
            )
            .setColor(Colors.DarkGreen)
            .setFooter(
                `Hosted by ${message.author.tag} - ${message.guild.name}`,
                message.guild.iconURL()
            );

        const gwButtonActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId(`gw_enter:${giveawayID}`),
        ]);

        return message.channel.send({
            embeds: [gwEmbed],
            components: [gwButtonActionRow],
        });
    }
}

module.exports = { GiveawaycreateCommand };
