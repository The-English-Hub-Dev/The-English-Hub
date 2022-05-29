const { container } = require("@sapphire/pieces");
const Sentry = require("@sentry/node");
const { Message } = require("discord.js");

class Utility {
  constructor() {}

  /**
   *
   * @param { Sentry.Exception } exception
   * @param { String } type
   */
  async exception(exception, type) {
    const sentryID = Sentry.captureException(exception);
    container.logger.error(
      `${type} exception with ID ${sentryID} sent to Sentry`
    );
    return sentryID;
  }

  /**
   *
   * @param { Message } message
   * @param { String } error
   */
  async errReply(message, error) {
    const reply = await message.reply({
      content: error,
      allowedMentions: { users: [], roles: [], parse: [] },
    });
    return setTimeout(() => reply.delete(), 3500);
  }
}

module.exports = { Utility };
