const { Listener, Events } = require('@sapphire/framework');
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
        this.container.logger.info(`Pinging...`);
        this.container.logger.info(
            `Ping acknowledged by the API. ${client.ws.ping} ms. Bot is online.\n\n`
        );

        setInterval(() => {
            const guild = client.guilds.cache.get('801609515391778826');
            client.user.setActivity(` ${guild.memberCount} members`, {
                type: 'WATCHING',
            });
        }, 20000);
    }
}

module.exports = { ReadyListener };
