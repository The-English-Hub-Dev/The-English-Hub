const { container } = require('@sapphire/framework');
const { Message, EmbedBuilder } = require('discord.js');

class TriggerManager {
    constructor() {}

    /**
     *
     * @param { Message } message
     */
    async runTriggersOnMessage(message) {
        let triggered = false;
        if (message.author.bot) return false;

        triggered = await this.runVivekHighlightTriggers(message);

        return triggered;
    }

    /**
     * @param { Message } message
     */
    async runVivekHighlightTriggers(message) {
        const vivekhltriggers = await container.redis.lrange(
            'hltriggers_vivek',
            0,
            -1
        );

        let triggered = false;

        for (let i = 0; i < vivekhltriggers.length; i++) {
            const trigger = vivekhltriggers[i];
            if (message.content.toLowerCase().includes(trigger.toLowerCase())) {
                const vivekMember = await message.guild.members.fetch(
                    '1031266462272336003'
                );

                const hltriggerembed = new EmbedBuilder()
                    .setTitle('Highlight Triggered')
                    .setDescription(
                        `Your word **${trigger}** was mentioned in ${message.channel} by ${message.author.tag} in ${message.guild}\nMessage: ${message.content} *[Jump to message](${message.url})*`
                    )
                    .setColor('DarkGold')
                    .setFooter({ text: 'Highlight Triggered' })
                    .setTimestamp();

                vivekMember
                    .send({ embeds: [hltriggerembed] })
                    .catch(() =>
                        container.logger.error(
                            `Failed to send a highlight message to ${vivekMember}`
                        )
                    );
                triggered = true;
            }
        }

        return triggered;
    }
}

module.exports = { TriggerManager };
