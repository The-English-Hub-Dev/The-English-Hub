const { Precondition } = require('@sapphire/framework');
const { Message, Permissions } = require('discord.js');
const { cmdChannels } = require('../../config.json');

class CommandChPrecondition extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('Staff')
                    .messageRun(message)
            ).isOk()
        )
            return this.ok();

        if (
            (
                await this.container.stores
                    .get('preconditions')
                    .get('Developer')
                    .messageRun(message)
            ).isOk()
        )
            return this.ok();
        else
            return cmdChannels.includes(message.channel.id)
                ? this.ok()
                : this.error({
                      message:
                          'This command can only be used in the following channels: <#' +
                          cmdChannels.join('>, <#') +
                          '>.',
                  });
    }
}
module.exports = { CommandChPrecondition };
