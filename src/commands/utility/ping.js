const { Command } = require("@sapphire/framework");
const { Stopwatch } = require("@sapphire/stopwatch");
const { Message } = require("discord.js");
class PingCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "ping",
      aliases: ["pong"],
      description: "Gets you the latency of the bot",
      preconditions: ["Staff"],
    });
  }

  /**
   *
   * @param { Message } message
   * @returns
   */
  async messageRun(message) {
    const stopwatch = new Stopwatch(0).start();

    const pong = await message.reply("Pinging...");
    if (!pong) return;
    stopwatch.stop();
    return pong.edit(
      `Pong! Websocket: \`${this.container.client.ws.ping}ms\` Bot Latency: \`${stopwatch}\``
    );
  }
}

module.exports = { PingCommand };
