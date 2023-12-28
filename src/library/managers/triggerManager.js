const { container } = require('@sapphire/framework');
const { Message, EmbedBuilder } = require('discord.js');

class TriggerManager {
    constructor() {}

    /**
     *
     * @param { Message } message
     * @returns { boolean } if a trigger was activated or not on the specific message
     */
    async runTriggersOnMessage(message) {
        let triggered = false;
        if (message.author.bot) return false;

        triggered = await this.runGuildTriggers(message);
        triggered = await this.runHlTriggers(message);

        return triggered;
    }

    /**
     * @param { Message } message
     * @returns { Promise<boolean> } if triggered or not
     */
    async runHlTriggers(message) {
        let hltriggered = false;

        hltriggered = await this.runVivekHighlightTriggers(message);

        return hltriggered;
    }

    /**
     * @param { Message } message
     * @returns { Promise<boolean> } if triggered or not
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

    /**
     * @param { Message } message
     * @returns { Promise<boolean> } if triggered or not by guild triggers
     */
    async runGuildTriggers(message) {
        let triggered = false;

        const guildTriggers = Object.entries(
            await container.redis.hgetall(`guildtriggers_${message.guild.id}`)
        );

        for (let i = 0; i < guildTriggers.length; i++) {
            const trigger = guildTriggers[i][0];
            const response = guildTriggers[i][1];
            if (message.content.toLowerCase().includes(trigger.toLowerCase())) {
                await message.reply({
                    content: response,
                    allowedMentions: { users: [], roles: [], parse: [] },
                });
                triggered = true;
            }
        }

        return triggered;
    }
}

module.exports = { TriggerManager };
