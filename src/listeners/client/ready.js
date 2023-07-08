const { Listener, Events, MessageCommand } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const {
    Client,
    EmbedBuilder,
    GuildMember,
    Colors,
    ActivityType,
} = require('discord.js');
let statusNum = 1;

class ReadyListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: true,
            event: Events.ClientReady,
        });
    }

    /**
     *
     * @param { Client } client
     */
    async run(client) {
        this.container.logger.info(`Logged in as ${client.user.tag}!`);

        const hasRebooted = await this.container.redis.hget('tasks', 'restart');
        if (hasRebooted) {
            const [channelID, restartTime] = hasRebooted.split(':');
            this.container.client.channels.cache.get(channelID).send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `The bot restarted successfully in ${new DurationFormatter().format(
                                Date.now() - restartTime
                            )}`
                        )
                        .setColor(Colors.Green),
                ],
            });
            await this.container.redis.hdel('tasks', 'restart');
        }

        this.container.logger.commandLogs = [];
        this.container.logger.errorLogs = [];
        this.container.intervals = {};

        const statusInterval = setInterval(() => {
            if (statusNum == 2) {
                const guild = client.guilds.cache.get('801609515391778826');
                if (guild) {
                    client.user.setActivity(
                        `${guild.memberCount.toLocaleString()} members`,
                        {
                            type: ActivityType.Watching,
                        }
                    );
                }
                statusNum--;
            } else {
                client.user.setActivity(
                    'DM me to ask a question to the staff!',
                    { type: ActivityType.Playing }
                );
                statusNum++;
            }
        }, 20000);

        const healthCheckIntervalHyperping = setInterval(async () => { await fetch(process.env.HYPERPING_HEALTHCHECK_URL, {method: 'POST'})}, 120000);

        this.container.intervals.status = statusInterval;
        this.container.intervals.healthCheck = healthCheckIntervalHyperping;
    }
}

module.exports = { ReadyListener };
