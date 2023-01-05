const { time, TimestampStyles } = require('@discordjs/builders');
const { Command, Args } = require('@sapphire/framework');
const { Stopwatch } = require('@sapphire/stopwatch');
const { Message, Permissions, MessageEmbed } = require('discord.js');

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
                member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)
        ).size;

        const members =
            guild.members.cache.filter((member) => !member.user.bot).size -
            staff;

        const memberGrowth = guild.members.cache.filter(
            (member) => member.joinedTimestamp > Date.now() - 86400000
        ).size;

        sw.stop();

        const embed = new MessageEmbed()
            .setTitle(`${guild.name} Member Details`)
            .setColor('LUMINOUS_VIVID_PINK')
            .addFields([
                {
                    name: '**Members**',
                    value: `${(
                        members - memberGrowth
                    ).toLocaleString()} + *${memberGrowth}*}`,
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
                `Total Members: ${guild.memberCount.toLocaleString()}. \nTotal Member growth in the last 24 hours(since ${time(
                    new Date(Date.now() - 86400000),
                    TimestampStyles.ShortDateTime
                )}): ${memberGrowth.toLocaleString()}`
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
