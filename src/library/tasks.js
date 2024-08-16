const { container } = require('@sapphire/pieces');
const {
    ActivityType,
    ChannelType,
    Colors,
    EmbedBuilder,
    time,
    TimestampStyles,
} = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const {
    vcbanlogChannelID,
    mainGuildID,
    mutedRoleID,
    welcomeChannel,
} = require('../../config.json');
let statusNum = 1;

class Tasks {
    constructor() {
        this.intervals = {};
    }

    async initializeTasks() {
        await this.initializeStatusTask();
        await this.initializeHealthcheck();
        await this.initializeVcUnbanTask();
        await this.initializeAutoUnmuteTask();
        this.initializeIntroductionAutpost();
    }

    async initializeStatusTask() {
        const statusInterval = setInterval(() => {
            if (statusNum == 3) {
                const guild =
                    container.client.guilds.cache.get('801609515391778826');
                if (guild) {
                    container.client.user.setActivity(
                        `${guild.memberCount.toLocaleString()} members`,
                        {
                            type: ActivityType.Watching,
                        }
                    );
                }
                statusNum = 1;
            } else if (statusNum == 2) {
                container.client.user.setActivity(
                    `Use ?help to see a list of my commands!`,
                    { type: ActivityType.Playing }
                );
                statusNum++;
            } else {
                container.client.user.setActivity(
                    'DM me to ask a question to the staff!',
                    { type: ActivityType.Playing }
                );
                statusNum++;
            }
        }, Time.Minute / 3);

        container.logger.info('Status task initialized.');
        this.intervals.status = statusInterval;
    }

    async initializeHealthcheck() {
        if (!process.env.HEALTHCHECK_URL) {
            container.logger.warn(
                'No healthcheck url was provided. Healthcheck task will not be initialized.'
            );
            return;
        }
        const healthCheckInterval = setInterval(async () => {
            await fetch(process.env.HEALTHCHECK_URL, {
                method: 'POST',
            });
        }, 120000);

        container.logger.info('Healthcheck task initialized.');
        this.intervals.healthCheck = healthCheckInterval;
    }

    async initializeVcUnbanTask() {
        const vcUnbanInterval = setInterval(async () => {
            const vcBans = Object.entries(
                await container.redis.hgetall('vcban')
            );
            for (var i = 0; i < vcBans.length; i++) {
                const [vChannelID, memberID] = vcBans[i][0].split(':');
                const banTime = Number(vcBans[i][1]);
                if (Date.now() - banTime > Time.Day) {
                    const vChannel =
                        container.client.channels.cache.get(vChannelID);
                    if (!vChannel || vChannel.type !== ChannelType.GuildVoice) {
                        return container.logger.warn(
                            `Removing VC ban task: VC unban channel not found. Voice Channel ID: ${vChannelID}`
                        );
                    }

                    const member = await vChannel.guild.members
                        .fetch(memberID)
                        .catch(() => null);
                    if (!member) {
                        return container.redis.hdel('vcban', vcBans[i][0]); // just delete the vc ban because this means the user left the server
                    }

                    await vChannel.permissionOverwrites.delete(
                        member,
                        `Auto removing vc ban after 24 hours.`
                    );

                    const dmEmbed = new EmbedBuilder()
                        .setColor(Colors.DarkGreen)
                        .setTitle(`You were unbanned from the vc ${vChannel}`)
                        .setAuthor({
                            name: vChannel.guild.name,
                            iconURL: vChannel.guild.iconURL(),
                        })
                        .setDescription(
                            `You can now join and chat in ${vChannel} again since 24 hours have passed. Make sure not to break any rules to prevent further action.`
                        )
                        .setFooter({
                            text: vChannel.guild.name,
                            iconURL: vChannel.guild.iconURL(),
                        })
                        .setTimestamp();

                    await member.send({ embeds: [dmEmbed] }).catch(() => {});

                    await container.redis.hdel('vcban', vcBans[i][0]);

                    const logEmbed = new EmbedBuilder()
                        .setColor(Colors.DarkRed)
                        .setTitle('VC Unban')
                        .setAuthor({
                            name: member.user.tag,
                            iconURL: member.user.avatarURL(),
                        })
                        .addFields(
                            {
                                name: 'User',
                                value: `${member.user.tag} (${member.user.id})`,
                            },
                            {
                                name: 'Moderator',
                                value: `${container.client.user.tag} (${container.client.user.id})`,
                            },
                            {
                                name: 'Reason',
                                value: `Auto VC unban after 24 hours.`,
                            },
                            {
                                name: 'Date',
                                value: time(
                                    new Date(),
                                    TimestampStyles.LongDateTime
                                ),
                            }
                        )
                        .setFooter({
                            text: 'Moderation Logs',
                            iconURL: member.guild.iconURL(),
                        })
                        .setThumbnail(container.client.user.avatarURL());

                    const logCh =
                        member.guild.channels.cache.get(vcbanlogChannelID);
                    if (logCh) await logCh.send({ embeds: [logEmbed] });

                    container.logger.info(
                        `Removing VC ban task: Unbanned ${member.user.tag} from ${vChannel.name} after 24 hours.`
                    );
                }
            }
        }, Time.Minute);

        container.logger.info('VC unban task initialized.');
        this.intervals.vcUnban = vcUnbanInterval;
    }

    async initializeIntroductionAutpost() {
        const introAutopostInterval = setInterval(async () => {
            const introChannel =
                container.client.channels.cache.get('852806317163937823');
            if (!introChannel) return;

            await introChannel.send(
                'Welcome to the auspicious learning universe. Join **Voice Channels** and **Classes** to enhance your English communication skills.'
            );
        }, Time.Hour * 3);

        container.logger.info('Introduction autopost task initialized.');
        this.intervals.introAutopost = introAutopostInterval;
    }

    async initializeAutoUnmuteTask() {
        const autoUnmuteInterval = setInterval(async () => {
            const currentMutedMembers = Object.entries(
                await container.redis.hgetall('muted')
            );
            const guild = container.client.guilds.cache.get(mainGuildID);

            for (var i = 0; i < currentMutedMembers.length; i++) {
                const muteTime = Number(
                    currentMutedMembers[i][0].split(':')[1]
                );
                const expireTime = Number(currentMutedMembers[i][1]);
                const memberID = currentMutedMembers[i][0].split(':')[0];

                if (expireTime - muteTime <= 0) {
                    const member = await guild.members.fetch(memberID);
                    // .catch(() => null);
                    if (!member) {
                        return container.redis.hdel(
                            'muted',
                            currentMutedMembers[i][0]
                        ); // just delete the vc ban because this means the user left the server
                    }

                    await member.roles.remove(
                        mutedRoleID,
                        'Auto unmuting user after the specified duration.'
                    );

                    const dmEmbed = new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle(`You were unmuted in ${guild.name}`)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            "You're now able to chat. Make sure to follow the rules to prevent further action."
                        )
                        .setFooter({
                            text: 'You may appeal this mute by opening a ticket',
                            iconURL: member.user.avatarURL(),
                        })
                        .setTimestamp(Date.now());

                    await member.send({ embeds: [dmEmbed] }).catch(() => {});

                    await container.redis.hdel(
                        'muted',
                        currentMutedMembers[i][0]
                    );

                    const logEmbed = new EmbedBuilder()
                        .setColor(Colors.Orange)
                        .setTitle('Mute')
                        .setAuthor({
                            name: member.user.tag,
                            iconURL: member.user.avatarURL(),
                        })
                        .addFields(
                            {
                                name: 'Punishment ID',
                                value: `\`${punishment.punishment_id}\``,
                            },
                            {
                                name: 'User',
                                value: `${member.user.tag} (${member.user.id})`,
                            },
                            {
                                name: 'Moderator',
                                value: `${message.author.tag} (${message.author.id})`,
                            },
                            { name: 'Reason', value: reason },
                            {
                                name: 'Date',
                                value: time(
                                    new Date(),
                                    TimestampStyles.LongDateTime
                                ),
                            },
                            {
                                name: 'Expires',
                                value: time(
                                    expiry,
                                    TimestampStyles.LongDateTime
                                ),
                            }
                        )
                        .setFooter({
                            text: 'Moderation Logs',
                            iconURL: message.guild.iconURL(),
                        })
                        .setThumbnail(this.container.client.user.avatarURL());

                    const logCh = guild.channels.cache.get(logChannelID);
                    if (!logCh) return;

                    await logCh.send({ embeds: [logEmbed] });

                    container.logger.info(
                        `Removing mute task: Unmuted ${member.user.tag} as their mute has expired.`
                    );
                }
            }
        }, Time.Minute);

        container.logger.info('Introduction autopost task initialized.');
        this.intervals.autoUnmute = autoUnmuteInterval;
    }
}

module.exports = { Tasks };
