const { Listener, Events } = require("@sapphire/framework");
const { Client } = require("discord.js");

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
  }
}

module.exports = { ReadyListener };
