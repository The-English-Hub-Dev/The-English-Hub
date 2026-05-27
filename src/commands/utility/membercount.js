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
            flags: ['full', 'scan', 'slow', 'force', 'fast', 'quick'],
            usage: '[--full|--fast] [--force]',
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const { guild } = message;

        const mcRepl = await message.reply(
            'Getting membercount details, please wait...'
        );
        const sw = new Stopwatch().start();

        const canFullScan = message.member?.permissions?.has(
            PermissionFlagsBits.ManageGuild
        );
        const fullScanLimit = 100000;
        const wantsFullScan = args.getFlags('full', 'scan', 'slow');
        const wantsFastScan = args.getFlags('fast', 'quick');
        const forceScan = args.getFlags('force');
        const isLargeGuild = guild.memberCount > fullScanLimit;

        let doFullScan = false;
        let scanNote = '';

        if (wantsFastScan) {
            doFullScan = false;
            scanNote = 'Fast mode forced with --fast.';
        } else if (wantsFullScan && !canFullScan) {
            doFullScan = false;
            scanNote = 'Full scan requires the Manage Server permission.';
        } else if (wantsFullScan) {
            if (isLargeGuild && !forceScan) {
                doFullScan = false;
                scanNote =
                    'Full scan blocked for large servers. Re-run with --full --force to override.';
            } else {
                doFullScan = true;
                scanNote = 'Full scan completed.';
            }
        } else if (!isLargeGuild) {
            doFullScan = true;
            scanNote = 'Full scan completed.';
        } else {
            doFullScan = false;
            scanNote = `Fast mode used for large servers (> ${fullScanLimit.toLocaleString()}).`;
        }

        const freshGuild = await guild.fetch({ withCounts: true });

        const verificationMap = {
            0: 'None',
            1: 'Low',
            2: 'Medium',
            3: 'High',
            4: 'Very High',
        };
        const contentFilterMap = {
            0: 'Disabled',
            1: 'Members Without Roles',
            2: 'All Members',
        };
        const mfaLevelMap = {
            0: 'Not Required',
            1: 'Required',
        };

        let embed;

        if (!doFullScan) {
            const approxMembers =
                freshGuild.approximateMemberCount ?? guild.memberCount;
            const approxPresence = freshGuild.approximatePresenceCount ?? null;
            const boostCount = freshGuild.premiumSubscriptionCount ?? 0;
            const boostTier =
                freshGuild.premiumTier > 0
                    ? `Tier ${freshGuild.premiumTier}`
                    : 'None';
            const roleCount = guild.roles.cache.size;
            const channelCount = guild.channels.cache.size;
            const emojiCount = guild.emojis.cache.size;
            const stickerCount = guild.stickers?.cache?.size ?? 0;

            sw.stop();

            embed = new EmbedBuilder()
                .setTitle(`${guild.name} Member Details`)
                .setColor(Colors.LuminousVividPink)
                .addFields([
                    {
                        name: '**Total Members**',
                        value: guild.memberCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Approx Members**',
                        value: approxMembers.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Approx Online**',
                        value: approxPresence
                            ? approxPresence.toLocaleString()
                            : 'Unknown',
                        inline: true,
                    },
                    {
                        name: '**Boosts**',
                        value: boostCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Boost Tier**',
                        value: boostTier,
                        inline: true,
                    },
                    {
                        name: '**Roles**',
                        value: roleCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Channels**',
                        value: channelCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Emojis**',
                        value: emojiCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Stickers**',
                        value: stickerCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Owner**',
                        value: `<@${guild.ownerId}>`,
                        inline: true,
                    },
                    {
                        name: '**Created**',
                        value: time(
                            guild.createdAt,
                            TimestampStyles.ShortDateTime
                        ),
                        inline: true,
                    },
                    {
                        name: '**Verification**',
                        value:
                            verificationMap[guild.verificationLevel] ??
                            'Unknown',
                        inline: true,
                    },
                    {
                        name: '**Content Filter**',
                        value:
                            contentFilterMap[guild.explicitContentFilter] ??
                            'Unknown',
                        inline: true,
                    },
                    {
                        name: '**2FA Required**',
                        value: mfaLevelMap[guild.mfaLevel] ?? 'Unknown',
                        inline: true,
                    },
                ])
                .setDescription(
                    `${scanNote}\nDetailed member breakdown requires a full scan. Use --full for a deep scan.`
                )
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                })
                .setTimestamp();
        } else {
            const now = Date.now();
            const dayMs = 86400000;
            const weekMs = 7 * dayMs;
            const monthMs = 30 * dayMs;

            let botCount = 0;
            let humanCount = 0;
            let staffCount = 0;
            let pendingCount = 0;
            let timedOutCount = 0;
            let boosterCount = 0;
            let rolelessCount = 0;
            let memberGrowth24h = 0;
            let memberGrowth7d = 0;
            let memberGrowth30d = 0;
            let newestJoinTs = 0;
            let oldestJoinTs = Number.MAX_SAFE_INTEGER;
            let newestMemberLabel = null;
            let oldestMemberLabel = null;

            let lastId;
            while (true) {
                const batch = await guild.members.fetch({
                    limit: 1000,
                    after: lastId,
                    cache: false,
                });

                if (!batch.size) break;

                for (const member of batch.values()) {
                    const isBot = member.user?.bot === true;

                    if (isBot) {
                        botCount += 1;
                    } else {
                        humanCount += 1;
                        if (
                            member.permissions.has(
                                PermissionFlagsBits.ManageMessages
                            )
                        ) {
                            staffCount += 1;
                        }
                    }

                    if (member.pending) pendingCount += 1;

                    if (
                        member.communicationDisabledUntilTimestamp &&
                        member.communicationDisabledUntilTimestamp > now
                    ) {
                        timedOutCount += 1;
                    }

                    if (member.premiumSinceTimestamp) boosterCount += 1;

                    if (member.roles?.cache?.size <= 1) rolelessCount += 1;

                    const joinedTs = member.joinedTimestamp;
                    if (joinedTs) {
                        if (joinedTs > now - dayMs) memberGrowth24h += 1;
                        if (joinedTs > now - weekMs) memberGrowth7d += 1;
                        if (joinedTs > now - monthMs) memberGrowth30d += 1;

                        if (joinedTs > newestJoinTs) {
                            newestJoinTs = joinedTs;
                            const label =
                                member.user?.tag ||
                                member.user?.username ||
                                member.displayName;
                            newestMemberLabel = `${label} (<@${member.id}>)`;
                        }

                        if (joinedTs < oldestJoinTs) {
                            oldestJoinTs = joinedTs;
                            const label =
                                member.user?.tag ||
                                member.user?.username ||
                                member.displayName;
                            oldestMemberLabel = `${label} (<@${member.id}>)`;
                        }
                    }
                }

                lastId = batch.last()?.id;
                if (!lastId || batch.size < 1000) break;
            }

            const regularMembers = Math.max(humanCount - staffCount, 0);

            sw.stop();

            embed = new EmbedBuilder()
                .setTitle(`${guild.name} Member Details`)
                .setColor(Colors.LuminousVividPink)
                .addFields([
                    {
                        name: '**Total**',
                        value: guild.memberCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Humans**',
                        value: humanCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Bots**',
                        value: botCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Regular Members**',
                        value: regularMembers.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Staff**',
                        value: staffCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Pending**',
                        value: pendingCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Timed Out**',
                        value: timedOutCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**Boosters**',
                        value: boosterCount.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: '**No Roles**',
                        value: rolelessCount.toLocaleString(),
                        inline: true,
                    },
                ])
                .setDescription(
                    `${scanNote}\nNew members since ${time(
                        new Date(now - dayMs),
                        TimestampStyles.ShortDateTime
                    )}: ${memberGrowth24h.toLocaleString()}\nNew members since ${time(
                        new Date(now - weekMs),
                        TimestampStyles.ShortDateTime
                    )}: ${memberGrowth7d.toLocaleString()}\nNew members since ${time(
                        new Date(now - monthMs),
                        TimestampStyles.ShortDateTime
                    )}: ${memberGrowth30d.toLocaleString()}\nNewest member: ${newestMemberLabel ?? 'Unknown'}\nOldest member: ${oldestMemberLabel ?? 'Unknown'}`
                )
                .setFooter({
                    text: `Requested by ${message.author.tag}`,
                })
                .setTimestamp();
        }

        return mcRepl.edit({
            content: `Membercount details fetched in ${sw}`,
            embeds: [embed],
            allowedMentions: { users: [], roles: [], parse: [] },
        });
    }
}

module.exports = { MembercountCommand };
