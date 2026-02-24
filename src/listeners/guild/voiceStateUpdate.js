const { Listener, Events } = require('@sapphire/framework');
const {
    VoiceState,
    ChannelType,
    EmbedBuilder,
    Colors,
    PermissionsBitField,
} = require('discord.js');
const {
    mainGuildID,
    cameraOnChannels,
    cameraWarningTimeout,
    cameraVCBanDuration,
    cameraMaxViolations,
    voiceStateLogChannelID,
    cameraWhitelistedRoles,
} = require('../../../config.json');

class VoiceStateUpdateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            name: Events.VoiceStateUpdate,
            event: Events.VoiceStateUpdate,
        });

        // Camera enforcement state
        this.warnedUsers = new Map();
        this.vcBannedUsers = new Map();
        this.violationTracker = new Map();
        this.scheduledUnlocks = new Map();
        this.cameraOnChannelsSet = new Set(cameraOnChannels || []);
        this.persistTimeout = null;
    }

    /**
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async run(oldState, newState) {
        await this.handleCameraEnforcement(oldState, newState);

        await this.logVoicestateChange(oldState, newState);
        // await this.handleRoomTwoCreation(oldState, newState);
        // await this.handleRoomThreeCreation(oldState, newState);
    }

    // Camera Enforcement Logic

    /**
     * Get the text channel linked to a voice channel
     * @param {VoiceChannel} voiceChannel
     * @returns {TextChannel|null}
     */
    getLinkedTextChannel(voiceChannel) {
        if (!voiceChannel) return null;

        // Discord stores the linked text channel in guild.channels
        // They typically share the same parent and have matching names
        const guild = voiceChannel.guild;

        // Try to find by exact ID match (if voice channel has messages enabled)
        // Note: Voice channels with chat enabled act as text channels too
        if (voiceChannel.isTextBased && voiceChannel.isTextBased()) {
            return voiceChannel;
        }

        // Find text channel in same category with matching name
        const parent = voiceChannel.parent;
        if (!parent) return null;

        // Look for text channels in same category
        const linkedChannel = guild.channels.cache.find(
            (ch) =>
                ch.type === ChannelType.GuildText &&
                ch.parentId === parent.id &&
                (ch.name ===
                    voiceChannel.name.toLowerCase().replace(/\s+/g, '-') ||
                    ch.topic?.includes(voiceChannel.id))
        );

        return linkedChannel || null;
    }

    /**
     * Main camera enforcement handler
     */
    async handleCameraEnforcement(oldState, newState) {
        const member =
            newState.member ||
            (newState.guild
                ? await newState.guild.members
                      .fetch(newState.id)
                      .catch(() => null)
                : null);
        if (!member || member.user.bot) return;

        // Skip camera enforcement for admins
        if (member.permissions.has(PermissionsBitField.Flags.Administrator))
            return;
        // Check if user has whitelisted role
        if (cameraWhitelistedRoles && cameraWhitelistedRoles.length > 0) {
            const hasWhitelistedRole = member.roles.cache.some((role) =>
                cameraWhitelistedRoles.includes(role.id)
            );
            if (hasWhitelistedRole) return;
        }

        const userId = member.id;
        const inTarget = Boolean(
            newState.channelId &&
            this.cameraOnChannelsSet.has(newState.channelId)
        );
        const wasInTarget = Boolean(
            oldState.channelId &&
            this.cameraOnChannelsSet.has(oldState.channelId)
        );

        // User joined a camera-required channel
        if (inTarget && !wasInTarget) {
            // Check ban
            const ban = this.vcBannedUsers.get(userId);
            if (ban && Date.now() < ban.bannedUntil) {
                this.container.logger.info(
                    `[CAMERA ENFORCE] ${member.user.tag} banned - evicting`
                );
                await this.lockUserAcrossCameraVCs(member.guild, userId, true);
                if (member.voice && member.voice.channel) {
                    await member.voice
                        .disconnect('Banned from camera VCs')
                        .catch(() => {});
                }
                const warnCh = this.getLinkedTextChannel(member.voice?.channel);
                if (warnCh) {
                    const remaining = Math.ceil(
                        (ban.bannedUntil - Date.now()) / 60000
                    );
                    const embed = new EmbedBuilder()
                        .setTitle('🚫 Ban Active')
                        .setColor(Colors.Red)
                        .setDescription(
                            `${member.user}, ban active for **${remaining} min**.\nExpires: <t:${Math.floor(ban.bannedUntil / 1000)}:R>`
                        )
                        .setTimestamp();
                    await warnCh
                        .send({ content: `${member.user}`, embeds: [embed] })
                        .catch(() => {});
                }
                return;
            }

            // Check camera
            if (newState.selfVideo) {
                return; // Camera already on, no warning needed
            }

            // Check paused timer
            const existing = this.warnedUsers.get(userId);
            if (existing && existing.timeoutId === null) {
                await this.resumeTimer(member);
                return;
            }

            // New warning
            if (!existing) {
                await this.warnUser(member);
            }
        }
        // User left a camera-required channel (to a non-camera channel)
        else if (!inTarget && wasInTarget) {
            this.userLeft(userId);
        }
        // User is still in a camera-required channel
        else if (inTarget && wasInTarget) {
            // Check if user switched between different camera VCs
            if (oldState.channelId !== newState.channelId) {
                // User switched from one camera VC to another

                // Check ban
                const ban = this.vcBannedUsers.get(userId);
                if (ban && Date.now() < ban.bannedUntil) {
                    this.container.logger.info(
                        `[CAMERA ENFORCE] ${member.user.tag} banned - evicting from new VC`
                    );
                    await this.lockUserAcrossCameraVCs(
                        member.guild,
                        userId,
                        true
                    );
                    if (member.voice && member.voice.channel) {
                        await member.voice
                            .disconnect('Banned from camera VCs')
                            .catch(() => {});
                    }
                    const warnCh = this.getLinkedTextChannel(
                        member.voice?.channel
                    );
                    if (warnCh) {
                        const remaining = Math.ceil(
                            (ban.bannedUntil - Date.now()) / 60000
                        );
                        const embed = new EmbedBuilder()
                            .setTitle('🚫 Ban Active')
                            .setColor(Colors.Red)
                            .setDescription(
                                `${member.user}, ban active for **${remaining} min**.\nExpires: <t:${Math.floor(ban.bannedUntil / 1000)}:R>`
                            )
                            .setTimestamp();
                        await warnCh
                            .send({
                                content: `${member.user}`,
                                embeds: [embed],
                            })
                            .catch(() => {});
                    }
                    return;
                }

                // Clear existing timer to prevent race condition
                const existing = this.warnedUsers.get(userId);
                if (existing?.timeoutId) {
                    clearTimeout(existing.timeoutId);
                    this.container.logger.info(
                        `[CAMERA ENFORCE] ${member.user.tag} switched VCs - cleared old timer`
                    );
                }

                // Restart timer if camera is still off
                if (!newState.selfVideo) {
                    await this.warnUser(member);
                } else {
                    this.warnedUsers.delete(userId);
                }
                return;
            }

            // User stayed in same channel - check for camera toggle
            if (newState.selfVideo && !oldState.selfVideo) {
                // Camera turned on
                await this.userComply(member);
            } else if (!newState.selfVideo && oldState.selfVideo) {
                // Camera turned off - clear existing timer first
                const existing = this.warnedUsers.get(userId);
                if (existing?.timeoutId) {
                    clearTimeout(existing.timeoutId);
                    this.container.logger.info(
                        `[CAMERA ENFORCE] ${member.user.tag} camera toggled off - cleared old timer`
                    );
                }
                await this.warnUser(member);
            }
        }
    }

    /**
     * Lock user from camera VCs
     */
    async lockUserAcrossCameraVCs(guild, userId, isBan = true) {
        if (!guild) return;

        for (const channelId of this.cameraOnChannelsSet) {
            try {
                const channel = await this.container.client.channels
                    .fetch(channelId)
                    .catch((err) => {
                        this.container.logger.warn(
                            `[LOCK ERROR] Failed to fetch channel ${channelId}: ${err?.message}`
                        );
                        return null;
                    });
                if (!channel || !channel.isVoiceBased()) continue;

                await channel.permissionOverwrites
                    .edit(
                        userId,
                        {
                            ViewChannel: true,
                            Connect: false,
                        },
                        {
                            reason: `VC Ban: ${userId}`,
                        }
                    )
                    .catch((err) => {
                        this.container.logger.error(
                            `[LOCK ERROR] Failed to edit overwrite for ${channelId} (${channel?.name}): ${err?.message}`
                        );
                    });
                this.container.logger.info(
                    `[BAN] Locked 📸 ${channel.name || channelId} || ${Array.from(this.cameraOnChannelsSet).indexOf(channelId) + 1} for ${userId}`
                );
            } catch (err) {
                this.container.logger.error(
                    `[LOCK ERROR] ${channelId}: ${err?.message}`
                );
            }
        }
    }

    /**
     * Unlock user from camera VCs
     */
    async unlockUserAcrossCameraVCs(guild, userId, isBan = true) {
        if (!guild) return;

        for (const channelId of this.cameraOnChannelsSet) {
            try {
                const channel = await this.container.client.channels
                    .fetch(channelId)
                    .catch((err) => {
                        this.container.logger.warn(
                            `[UNLOCK ERROR] Failed to fetch channel ${channelId}: ${err?.message}`
                        );
                        return null;
                    });
                if (!channel || !channel.isVoiceBased()) continue;

                const overwrite =
                    channel.permissionOverwrites.cache.get(userId);
                if (overwrite) {
                    await channel.permissionOverwrites
                        .delete(userId, {
                            reason: `VC Ban expired: ${userId}`,
                        })
                        .catch((err) => {
                            this.container.logger.error(
                                `[UNLOCK ERROR] Failed to delete overwrite for ${channelId} (${channel?.name}): ${err?.message}`
                            );
                        });
                    this.container.logger.info(
                        `[BAN] Unlocked 📸 ${channel.name || channelId} || ${Array.from(this.cameraOnChannelsSet).indexOf(channelId) + 1} for ${userId}`
                    );
                }
            } catch (err) {
                this.container.logger.error(
                    `[UNLOCK ERROR] ${channelId}: ${err?.message}`
                );
            }
        }
    }

    /**
     * Warn user to enable camera
     */
    async warnUser(member, customTimeout = null) {
        const userId = member.id;
        if (this.warnedUsers.has(userId)) return;

        const timeoutDuration = customTimeout || cameraWarningTimeout;
        this.container.logger.info(
            `[CAMERA WARN] ${member.user.tag} - ${timeoutDuration}ms timer`
        );

        const warningChannel = this.getLinkedTextChannel(member.voice?.channel);
        if (!warningChannel) {
            this.container.logger.error('[CAMERA WARN] Channel not found');
            return;
        }

        const currentViolations = this.violationTracker.get(userId) || 0;
        const seconds = Math.ceil(timeoutDuration / 1000);

        const embed = new EmbedBuilder()
            .setTitle('📷 Camera Required')
            .setDescription(
                `Hey ${member.user}, turn on your camera within **${seconds}s**.\n\n⚠️ Violations: **${currentViolations}/${cameraMaxViolations}**`
            )
            .setColor(Colors.Red)
            .setTimestamp();

        const msg = await warningChannel
            .send({ content: `${member.user}`, embeds: [embed] })
            .catch(() => null);

        const startTime = Date.now();
        const timeoutId = setTimeout(() => {
            if (this.warnedUsers.has(userId)) {
                this.kickUser(member, msg).catch((err) =>
                    this.container.logger.error(err)
                );
            }
        }, timeoutDuration);

        this.warnedUsers.set(userId, {
            timeoutId,
            channelId: member.voice?.channelId,
            warningMessageId: msg ? msg.id : null,
            remainingTime: timeoutDuration,
            startTime,
        });
    }

    /**
     * Kick user and apply ban
     */
    async kickUser(member, warningMessage = null) {
        const userId = member.id;
        const warningData = this.warnedUsers.get(userId);
        const storedChannelId = warningData?.channelId;
        this.container.logger.info(`[CAMERA KICK] ${member.user.tag}`);

        const currentViolations = (this.violationTracker.get(userId) || 0) + 1;
        this.violationTracker.set(userId, currentViolations);
        this.persistState();

        // Store the channel before disconnecting
        const preDisconnectChannel = member.voice?.channel;

        if (member.voice && member.voice.channel) {
            await member.voice
                .disconnect('Failed to enable camera')
                .catch(() => {});
        }

        if (currentViolations >= cameraMaxViolations) {
            const bannedUntil = Date.now() + cameraVCBanDuration;
            this.vcBannedUsers.set(userId, {
                bannedUntil,
                violationCount: currentViolations,
            });
            this.persistState();

            await this.lockUserAcrossCameraVCs(member.guild, userId, true);
            this.scheduleUnlock(userId, bannedUntil, true);

            try {
                // Use the stored channel before disconnect, then fallback to fetching
                const voiceChannel =
                    preDisconnectChannel ||
                    (storedChannelId
                        ? await member.guild.channels
                              .fetch(storedChannelId)
                              .catch(() => null)
                        : null);

                const warningChannel = this.getLinkedTextChannel(voiceChannel);
                const banMinutes = Math.ceil(cameraVCBanDuration / 60000);
                const banEmbed = new EmbedBuilder()
                    .setTitle('🚫 VC Ban Issued')
                    .setColor(Colors.Black)
                    .setDescription(
                        `${member.user.tag}, you're banned from camera VCs for **${banMinutes} min**.\n\n🔒 VCs locked. Ban expires: <t:${Math.floor(bannedUntil / 1000)}:R>`
                    )
                    .setTimestamp();

                if (warningMessage) {
                    await warningMessage
                        .edit({ content: null, embeds: [banEmbed] })
                        .catch(() => {});
                } else if (warningChannel) {
                    await warningChannel
                        .send({ content: `${member.user}`, embeds: [banEmbed] })
                        .catch((err) => {
                            this.container.logger.error(
                                '[CAMERA KICK] Ban message send failed:',
                                err?.message || 'Unknown error'
                            );
                        });
                } else {
                    this.container.logger.warn(
                        `[CAMERA KICK] Could not find text channel for voice channel ${storedChannelId}`
                    );
                }

                // Send DM as well for direct notification
                await member.send({ embeds: [banEmbed] }).catch((err) => {
                    this.container.logger.warn(
                        `[CAMERA KICK] Failed to send ban DM to ${member.user.tag}:`,
                        err?.message || 'Unknown error'
                    );
                });
            } catch (err) {
                this.container.logger.error(
                    '[CAMERA KICK] Ban notice failed:',
                    err?.message || 'Unknown error'
                );
            }
        }

        this.warnedUsers.delete(userId);
    }

    /**
     * Schedule automatic unlock
     */
    scheduleUnlock(userId, endTimestamp, isBan) {
        const now = Date.now();
        const delay = Math.max(0, endTimestamp - now);

        const prev = this.scheduledUnlocks.get(userId);
        if (prev) clearTimeout(prev);

        const timeoutId = setTimeout(async () => {
            try {
                this.scheduledUnlocks.delete(userId);

                const guild = await this.container.client.guilds
                    .fetch(mainGuildID)
                    .catch(() => null);
                if (!guild) {
                    this.container.logger.warn(
                        `[CAMERA UNLOCK] Guild not found`
                    );
                    this.vcBannedUsers.delete(userId);
                    this.violationTracker.delete(userId);
                    this.persistState();
                    return;
                }

                const member = await guild.members
                    .fetch(userId)
                    .catch(() => null);
                if (!member) {
                    this.container.logger.info(
                        `[CAMERA UNLOCK] User ${userId} not found in guild`
                    );
                    this.vcBannedUsers.delete(userId);
                    this.violationTracker.delete(userId);
                    this.persistState();
                    return;
                }

                // Remove from state
                this.vcBannedUsers.delete(userId);
                this.violationTracker.delete(userId);

                // Unlock VCs
                await this.unlockUserAcrossCameraVCs(guild, userId, isBan);
                this.persistState();

                // Send notification
                await this.notifyVCUnban(member);
            } catch (err) {
                this.container.logger.error(
                    '[CAMERA SCHEDULE UNLOCK] Error:',
                    err.message
                );
            }
        }, delay);

        this.scheduledUnlocks.set(userId, timeoutId);
    }

    /**
     * User complied by enabling camera
     */
    async userComply(member) {
        const userId = member.id;
        const warningData = this.warnedUsers.get(userId);
        if (!warningData) return;

        this.container.logger.info(`[CAMERA COMPLY] ${member.user.tag}`);

        const prevViolations = this.violationTracker.get(userId) || 0;
        let resetMessage = '';
        if (prevViolations > 0) {
            this.violationTracker.delete(userId);
            this.persistState();
            resetMessage = '\n🔄 Violations reset to 0.';
            this.container.logger.info(`[CAMERA RESET] ${member.user.tag}`);
        }

        clearTimeout(warningData.timeoutId);

        try {
            const warningChannel = this.getLinkedTextChannel(
                member.voice?.channel
            );
            if (warningChannel && warningData.warningMessageId) {
                const msg = await warningChannel.messages
                    .fetch(warningData.warningMessageId)
                    .catch(() => null);
                if (msg) {
                    const complyEmbed = new EmbedBuilder()
                        .setTitle('✅ Camera Enabled')
                        .setColor(Colors.Green)
                        .setDescription(`Thanks ${member.user}!${resetMessage}`)
                        .setTimestamp();
                    await msg
                        .edit({ content: null, embeds: [complyEmbed] })
                        .catch(() => {});
                    setTimeout(() => msg.delete().catch(() => {}), 5000);
                }
            }
        } catch (err) {
            this.container.logger.warn(
                '[CAMERA COMPLY] Message update failed:',
                err.message
            );
        }

        this.warnedUsers.delete(userId);
    }

    /**
     * User left VC - pause timer
     */
    userLeft(userId) {
        const warningData = this.warnedUsers.get(userId);
        if (!warningData) return;

        this.container.logger.info(
            `[CAMERA LEAVE] Pausing timer for ${userId}`
        );
        const elapsed = Date.now() - (warningData.startTime || 0);
        const remaining = Math.max(
            0,
            (warningData.remainingTime || cameraWarningTimeout) - elapsed
        );

        // Clear timeout to prevent memory leak
        if (warningData.timeoutId) {
            clearTimeout(warningData.timeoutId);
        }

        this.warnedUsers.set(userId, {
            ...warningData,
            timeoutId: null,
            remainingTime: remaining,
        });
    }

    /**
     * Resume timer when user rejoins
     */
    async resumeTimer(member) {
        const userId = member.id;
        const warningData = this.warnedUsers.get(userId);
        if (!warningData) return;

        if (!warningData.remainingTime || warningData.remainingTime <= 0) {
            this.container.logger.info(
                `[CAMERA RESUME] Timer expired for ${member.user.tag}`
            );
            await this.kickUser(member, null);
            return;
        }

        this.container.logger.info(
            `[CAMERA RESUME] ${member.user.tag} - ${warningData.remainingTime}ms`
        );

        const warningChannel = this.getLinkedTextChannel(member.voice?.channel);
        let warningMessage = null;
        if (warningChannel && warningData.warningMessageId) {
            warningMessage = await warningChannel.messages
                .fetch(warningData.warningMessageId)
                .catch(() => null);
        }

        const currentViolations = this.violationTracker.get(userId) || 0;
        const seconds = Math.ceil(warningData.remainingTime / 1000);
        if (warningMessage) {
            const embed = new EmbedBuilder()
                .setTitle('📷 Timer Resumed')
                .setColor(0xff6600)
                .setDescription(
                    `${member.user}, you have **${seconds}s** left.\n\n⚠️ Violations: **${currentViolations}/${cameraMaxViolations}**`
                )
                .setTimestamp();
            await warningMessage
                .edit({ content: `${member.user}`, embeds: [embed] })
                .catch(() => {});
        }

        const startTime = Date.now();
        const timeoutId = setTimeout(() => {
            if (this.warnedUsers.has(userId)) {
                this.kickUser(member, warningMessage).catch((err) =>
                    this.container.logger.error(err)
                );
            }
        }, warningData.remainingTime);

        // Store timeoutId to ensure proper cleanup
        this.warnedUsers.set(userId, {
            ...warningData,
            timeoutId,
            startTime,
            remainingTime: warningData.remainingTime,
        });
    }

    /**
     * Notify user ban expired
     */
    async notifyVCUnban(member) {
        try {
            const ch = await this.getLinkedTextChannel(member.voice?.channel);
            if (!ch) return;
            const embed = new EmbedBuilder()
                .setTitle('✅ Ban Expired')
                .setColor(Colors.Green)
                .setDescription(
                    `${member.user}, VC ban over. Violations reset. VCs unlocked.`
                )
                .setTimestamp();
            await ch
                .send({ content: `${member.user}`, embeds: [embed] })
                .catch(() => {});
        } catch (err) {
            this.container.logger.error(
                '[CAMERA NOTIFY] Unban failed:',
                err.message
            );
        }
    }

    /**
     * Load state from Redis
     */
    async loadState() {
        try {
            const vcBannedUsersData = await this.container.redis.hgetall(
                'camera:vcBannedUsers'
            );
            const violationTrackerData = await this.container.redis.hgetall(
                'camera:violationTracker'
            );

            if (vcBannedUsersData) {
                for (const [uid, dataStr] of Object.entries(
                    vcBannedUsersData
                )) {
                    try {
                        const data = JSON.parse(dataStr);
                        this.vcBannedUsers.set(uid, data);
                    } catch (e) {
                        this.container.logger.warn(
                            `[CAMERA STATE] Failed to parse vcBannedUsers data for ${uid}:`,
                            e.message
                        );
                    }
                }
            }

            if (violationTrackerData) {
                for (const [uid, countStr] of Object.entries(
                    violationTrackerData
                )) {
                    const count = parseInt(countStr, 10);
                    if (!isNaN(count)) {
                        this.violationTracker.set(uid, count);
                    }
                }
            }

            this.container.logger.info(
                `[CAMERA STATE] Loaded from Redis - ${this.vcBannedUsers.size} bans, ${this.violationTracker.size} violations`
            );
        } catch (err) {
            this.container.logger.warn(
                '[CAMERA STATE] Load failed:',
                err.message
            );
        }
    }

    /**
     * Persist state to Redis (debounced to prevent excessive writes)
     */
    persistState() {
        if (this.persistTimeout) {
            clearTimeout(this.persistTimeout);
        }
        this.persistTimeout = setTimeout(async () => {
            try {
                const pipeline = this.container.redis.pipeline();

                // Clear existing data
                pipeline.del('camera:vcBannedUsers');
                pipeline.del('camera:violationTracker');

                // Save vcBannedUsers
                if (this.vcBannedUsers.size > 0) {
                    const vcBannedData = {};
                    for (const [uid, data] of this.vcBannedUsers.entries()) {
                        vcBannedData[uid] = JSON.stringify(data);
                    }
                    pipeline.hmset('camera:vcBannedUsers', vcBannedData);
                }

                // Save violationTracker
                if (this.violationTracker.size > 0) {
                    const violationData = {};
                    for (const [
                        uid,
                        count,
                    ] of this.violationTracker.entries()) {
                        violationData[uid] = count.toString();
                    }
                    pipeline.hmset('camera:violationTracker', violationData);
                }

                await pipeline.exec();
                this.container.logger.info(
                    `[CAMERA STATE] Saved to Redis - ${this.vcBannedUsers.size} bans, ${this.violationTracker.size} violations`
                );
            } catch (err) {
                this.container.logger.error(
                    '[CAMERA STATE] Save failed:',
                    err.message
                );
            }
        }, 1000);
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async handleRoomTwoCreation(oldState, newState) {
        if (!newState.channelId) return;

        const twoRooms = oldState.guild.channels.cache
            .filter(
                (channel) =>
                    channel.parent &&
                    channel.type == ChannelType.GuildVoice &&
                    channel.parent.id === twoRoomsParentID
            )
            .sort((a, b) => a.position - b.position);

        if (newState.channel.id === twoRooms.last().id) {
            this.container.logger.info('Creating new room 2');
            const newChannel = await oldState.guild.channels.create({
                name: `Room 2.${
                    Number(twoRooms.last().name.split(' ')[1].split('.')[1]) + 1
                }`,
                type: ChannelType.GuildVoice,
                parent: twoRooms.last().parent,
                userLimit: 2,
                reason: 'New 2 room vc creation as all current rooms are full.',
            });
        }
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async handleRoomThreeCreation(oldState, newState) {
        if (!newState.channelId) return;

        const threeRooms = oldState.guild.channels.cache
            .filter(
                (channel) =>
                    channel.parent &&
                    channel.type == ChannelType.GuildVoice &&
                    channel.parent.id === threeRoomsParentID
            )
            .sort((a, b) => a.position - b.position);

        if (newState.channel.id === threeRooms.last().id) {
            this.container.logger.info('Creating new room 3');
            const newChannel = await oldState.guild.channels.create({
                name: `Room 3.${
                    Number(threeRooms.last().name.split(' ')[1].split('.')[1]) +
                    1
                }`,
                type: ChannelType.GuildVoice,
                parent: threeRooms.last().parent,
                userLimit: 3,
                reason: 'New 3 room vc creation as all current rooms are full.',
            });
        }
    }

    /**
     *
     * @param { VoiceState } oldState
     * @param { VoiceState } newState
     */
    async logVoicestateChange(oldState, newState) {
        if (oldState.guild.id !== mainGuildID) return;
        const logEmbed = new EmbedBuilder();
        const voiceStateLogChannel = newState.guild.channels.cache.get(
            voiceStateLogChannelID
        );
        if (oldState.channelId === newState.channelId) return;
        if (oldState.channelId && newState.channelId) {
            // member switched vcs
            logEmbed
                .setColor(Colors.DarkerGrey)
                .setTitle('Member switched voice channels')
                .addFields(
                    {
                        name: 'Member',
                        value: `${newState.member.user} (${newState.member.id})`,
                    },
                    {
                        name: 'Old Channel',
                        value: `${oldState.channel} (${oldState.channel.name} → ${oldState.channel.id})`,
                        inline: true,
                    },
                    {
                        name: 'New Channel',
                        value: `${newState.channel} (${newState.channel.name} → ${newState.channel.id})`,
                        inline: true,
                    },
                    {
                        name: `Current Members of ${newState.channel.name}`,
                        value: newState.channel.members.size
                            ? newState.channel.members
                                  .map((member) => member.user)
                                  .join(', ')
                            : 'None',
                    }
                )
                .setTimestamp();
        } else if (!oldState.channelId) {
            // member joined vc
            logEmbed
                .setColor(Colors.DarkGreen)
                .setTitle('Member joined voice channel')
                .addFields(
                    {
                        name: 'Member',
                        value: `${newState.member.user} (${newState.member.id})`,
                        inline: true,
                    },
                    {
                        name: 'Channel',
                        value: `${newState.channel} (${newState.channel.name} → ${newState.channel.id})`,
                        inline: true,
                    },
                    {
                        name: 'Status',
                        value: `${
                            newState.selfDeaf ? 'Deafened' : 'Not Deafened'
                        }, ${newState.selfMute ? 'Muted' : 'Unmuted'}, ${
                            newState.selfVideo
                                ? 'Video Enabled'
                                : 'Video Disabled'
                        }`,
                    },
                    {
                        name: `Current Members of ${newState.channel.name}`,
                        value: newState.channel.members.size
                            ? newState.channel.members
                                  .map((member) => member.user)
                                  .join(', ')
                            : 'None',
                    }
                )
                .setTimestamp();
        } else if (!newState.channelId) {
            // member left vc
            logEmbed
                .setColor(Colors.DarkRed)
                .setTitle('Member left voice channel')
                .addFields(
                    {
                        name: 'Member',
                        value: `${oldState.member.user} (${oldState.member.id})`,
                        inline: true,
                    },
                    {
                        name: 'Channel',
                        value: `${oldState.channel} (${oldState.channel.name} → ${oldState.channel.id})`,
                        inline: true,
                    },
                    {
                        name: `Current Members of ${oldState.channel.name}`,
                        value: oldState.channel.members.size
                            ? oldState.channel.members
                                  .map((member) => member.user)
                                  .join(', ')
                            : 'None',
                    }
                )
                .setTimestamp();
        }
        return voiceStateLogChannel.send({ embeds: [logEmbed] });
    }

    /**
     * Cleanup method to prevent memory leaks
     * Clears all timeouts and scheduled unlocks when listener is destroyed
     */
    onUnload() {
        // Clear all warning timeouts
        for (const [userId, warningData] of this.warnedUsers.entries()) {
            if (warningData.timeoutId) {
                clearTimeout(warningData.timeoutId);
            }
        }
        this.warnedUsers.clear();

        // Clear all scheduled unlocks
        for (const [userId, timeoutId] of this.scheduledUnlocks.entries()) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
        this.scheduledUnlocks.clear();

        // Clear persist timeout to prevent memory leak
        if (this.persistTimeout) {
            clearTimeout(this.persistTimeout);
            this.persistTimeout = null;
        }

        this.container.logger.info(
            '[CAMERA CLEANUP] All timeouts and scheduled unlocks cleared'
        );
    }
}

module.exports = { VoiceStateUpdateListener };
