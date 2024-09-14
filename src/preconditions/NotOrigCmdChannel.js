const { Precondition } = require('@sapphire/framework');
const { Message } = require('discord.js');

class NotOrigCmdChannelPreconditon extends Precondition {
    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        if (message.channel.id == '1092367542720413787')
            return this.error({
                message:
                    'This command cannot be used in this commands channel.',
            });

        return this.ok();
    }
}

module.exports = { NotOrigCmdChannelPreconditon };
