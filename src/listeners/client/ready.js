const { Listener, Events, MessageCommand } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const {
    Client,
    EmbedBuilder,
    GuildMember,
    Colors,
    ActivityType,
} = require('discord.js');
const { Tasks } = require('../../library/tasks');
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
        this.container.tasks = new Tasks();
        await this.container.tasks.initializeTasks();
    }
}

module.exports = { ReadyListener };
