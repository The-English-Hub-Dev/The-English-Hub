const { Listener, Events } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const { Client } = require('discord.js');

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
        this.container.logger.info(
            `Ping acknowledged by the API. Bot is online.\n\n`
        );

        const hasRebooted = await this.container.redis.hget('tasks', 'restart');
        if (hasRebooted) {
            const [channelID, restartTime] = hasRebooted.split(':');
            this.container.client.channels.cache
                .get(channelID)
                .send(
                    `The bot restarted successfully in ${new DurationFormatter().format(
                        Date.now() - restartTime
                    )}`
                );
            await this.container.redis.hdel('tasks', 'restart');
        }

        setInterval(() => {
            const guild = client.guilds.cache.get('801609515391778826');
            client.user.setActivity(` ${guild.memberCount} members`, {
                type: 'WATCHING',
            });
        }, 20000);
    }
}

module.exports = { ReadyListener };
