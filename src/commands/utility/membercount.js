const { time, TimestampStyles } = require('@discordjs/builders');
const { Command, Args } = require('@sapphire/framework');
const { Stopwatch } = require('@sapphire/stopwatch');
const {
    Message,
    EmbedBuilder,
    Colors,
    PermissionFlagsBits,
} = require('discord.js');

class MembercountCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'membercount',
            aliases: ['mc'],
            preconditions: ['CmdCh'],
            description: 'Gives you details about the server membercount.',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } _args
     */
    async messageRun(message, _args) {
        const { guild } = message;

        const mcRepl = await message.reply(
            'Getting membercount details, please wait...'
        );
        const sw = new Stopwatch().start();

        await message.guild.members.fetch();

        const bots = guild.members.cache.filter(
            (member) => member.user.bot
        ).size;

        const staff = guild.members.cache.filter(
            (member) =>
                !member.user.bot &&
                member.permissions.has(PermissionFlagsBits.ManageMessages)
        ).size;

        const members =
            guild.members.cache.filter((member) => !member.user.bot).size -
            staff;

        const memberGrowth24h = guild.members.cache.filter(
            (member) => member.joinedTimestamp > Date.now() - 86400000
        ).size;

        const memberGrowth7d = guild.members.cache.filter(
            (member) => member.joinedTimestamp > Date.now() - 604800000
        ).size;

        sw.stop();

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Member Details`)
            .setColor(Colors.LuminousVividPink)
            .addFields([
                {
                    name: '**Members**',
                    value: `${(
                        members - memberGrowth24h
                    ).toLocaleString()} + *${memberGrowth24h}*`,
                    inline: true,
                },
                {
                    name: '**Bots**',
                    value: bots.toLocaleString(),
                    inline: true,
                },
                {
                    name: '**Staff**',
                    value: staff.toLocaleString(),
                    inline: true,
                },
            ])
            .setDescription(
                `Total Members: ${guild.memberCount.toLocaleString()}. \nTotal member growth since ${time(
                    new Date(Date.now() - 86400000),
                    TimestampStyles.ShortDateTime
                )}): ${memberGrowth24h.toLocaleString()}\nTotal member growth since ${time(
                    new Date(Date.now() - 604800000),
                    TimestampStyles.ShortDateTime
                )}): ${memberGrowth7d.toLocaleString()}`
            )
            .setFooter({
                text: `Requested by ${message.author.tag}`,
            })
            .setTimestamp();

        return mcRepl.edit({
            content: `Membercount details fetched in ${sw}`,
            embeds: [embed],
        });
    }
}

module.exports = { MembercountCommand };
