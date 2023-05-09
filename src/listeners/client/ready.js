const { Listener, Events, MessageCommand } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const { Client, MessageEmbed, GuildMember } = require('discord.js');
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
        this.container.logger.info(
            `Ping acknowledged by the API. Bot is online.\n\n`
        );

        const hasRebooted = await this.container.redis.hget('tasks', 'restart');
        if (hasRebooted) {
            const [channelID, restartTime] = hasRebooted.split(':');
            this.container.client.channels.cache.get(channelID).send({
                embeds: [
                    new MessageEmbed()
                        .setDescription(
                            `The bot restarted successfully in ${new DurationFormatter().format(
                                Date.now() - restartTime
                            )}`
                        )
                        .setColor('GREEN'),
                ],
            });
            await this.container.redis.hdel('tasks', 'restart');
        }

        this.container.logger.commandLogs = [];
        this.container.intervals = {};

        const statusInterval = setInterval(() => {
            if (statusNum == 2) {
                const guild = client.guilds.cache.get('801609515391778826');
                client.user.setActivity(
                    ` ${guild.memberCount.toLocaleString()} members`,
                    {
                        type: 'WATCHING',
                    }
                );
                statusNum--;
            } else {
                client.user.setActivity(
                    'DM me to report or to ask a question!',
                    { type: 'PLAYING' }
                );
                statusNum++;
            }
        }, 20000);

        this.container.intervals.status = statusInterval;
    }
}

module.exports = { ReadyListener };
