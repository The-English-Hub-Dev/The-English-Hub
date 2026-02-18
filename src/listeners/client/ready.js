const { Listener, Events } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const {
    Client,
    EmbedBuilder,
    GuildMember,
    Colors,
    ActivityType,
} = require('discord.js');
const { Tasks } = require('../../library/tasks');
const { mainGuildID } = require('../../../config.json');

class ReadyListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: true,
            event: Events.ClientReady,
        });
    }

    /**
     * @param { Client } client
     */
    async run(client) {
        this.container.logger.info(`Logged in as ${client.user.tag}!`);

        const hasRebooted = await this.container.redis.hget('tasks', 'restart');
        if (hasRebooted) {
            const [channelID, restartTime] = hasRebooted.split(':');
            const channel = this.container.client.channels.cache.get(channelID);
            if (channel) {
                await channel
                    .send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `The bot restarted successfully in ${new DurationFormatter().format(
                                        Date.now() - restartTime
                                    )}`
                                )
                                .setColor(Colors.Green),
                        ],
                    })
                    .catch((err) => {
                        this.container.logger.error(
                            'Failed to send restart message:',
                            err
                        );
                    });
            } else {
                this.container.logger.warn(
                    `Restart notification channel ${channelID} not found`
                );
            }
            await this.container.redis.hdel('tasks', 'restart');
        }

        this.container.logger.commandLogs = [];
        this.container.logger.errorLogs = [];
        this.container.tasks = new Tasks();
        await this.container.tasks.initializeTasks();

        // Initialize camera enforcement
        await this.initializeCameraEnforcement();
    }

    /**
     * Initialize camera enforcement state and restore locks
     */
    async initializeCameraEnforcement() {
        try {
            // Get the VoiceStateUpdate listener instance
            const voiceListener = this.container.stores
                .get('listeners')
                .get('voiceStateUpdate');
            if (!voiceListener) {
                this.container.logger.warn(
                    '[CAMERA INIT] VoiceStateUpdate listener not found'
                );
                return;
            }

            // Load state from Redis
            await voiceListener.loadState();

            const guild = await this.container.client.guilds
                .fetch(mainGuildID)
                .catch(() => null);
            if (!guild) {
                this.container.logger.error(
                    '[CAMERA INIT] Main guild not found'
                );
                return;
            }

            // Restore locks for banned users
            for (const [
                userId,
                data,
            ] of voiceListener.vcBannedUsers.entries()) {
                const remaining = data.bannedUntil - Date.now();
                const member = await guild.members
                    .fetch(userId)
                    .catch(() => null);

                if (!member) {
                    voiceListener.vcBannedUsers.delete(userId);
                    voiceListener.violationTracker.delete(userId);
                    continue;
                }

                await voiceListener.lockUserAcrossCameraVCs(
                    guild,
                    userId,
                    true
                );

                if (remaining > 0) {
                    voiceListener.scheduleUnlock(
                        userId,
                        data.bannedUntil,
                        true
                    );
                } else {
                    voiceListener.vcBannedUsers.delete(userId);
                    voiceListener.violationTracker.delete(userId);
                    await voiceListener.unlockUserAcrossCameraVCs(
                        guild,
                        userId,
                        true
                    );
                }
            }

            voiceListener.persistState();
            this.container.logger.info(
                '[CAMERA INIT] Locks restored successfully'
            );
        } catch (err) {
            this.container.logger.error('[CAMERA INIT] Failed:', err.message);
        }
    }
}

module.exports = { ReadyListener };
