const { container } = require('@sapphire/framework');
const { Message, EmbedBuilder } = require('discord.js');

class TriggerManager {
    constructor() {
        this.vivekTriggerCache = {
            value: [],
            expiresAt: 0,
        };
        this.guildTriggerCache = new Map();
    }

    /**
     *
     * @param { Message } message
     * @returns { boolean } if a trigger was activated or not on the specific message
     */
    async runTriggersOnMessage(message) {
        if (message.author.bot) return false;
        if (!message.content) return false;

        const guildTriggered = await this.runGuildMessageTriggers(message);
        const hlTriggered = await this.runHlTriggers(message);

        return guildTriggered || hlTriggered;
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
        const vivekhltriggers = await this.getCachedVivekTriggers();

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

    async getCachedVivekTriggers() {
        const now = Date.now();
        if (this.vivekTriggerCache.expiresAt > now) {
            return this.vivekTriggerCache.value;
        }

        const triggers = await container.redis.lrange(
            'hltriggers_vivek',
            0,
            -1
        );
        this.vivekTriggerCache = {
            value: triggers,
            expiresAt: now + 30_000,
        };

        return triggers;
    }

    async getCachedGuildTriggers(guildId) {
        const cached = this.guildTriggerCache.get(guildId);
        const now = Date.now();
        if (cached && cached.expiresAt > now) {
            return cached.value;
        }

        const triggers = await container.redis.hgetall(
            `guildtriggers_${guildId}`
        );
        this.guildTriggerCache.set(guildId, {
            value: triggers,
            expiresAt: now + 15_000,
        });

        return triggers;
    }

    /**
     * @param { Message } message
     * @returns { Promise<boolean> } if triggered or not by guild triggers
     */
    async runGuildMessageTriggers(message) {
        let triggered = false;

        const guildMessageTriggers = Object.entries(
            await this.getCachedGuildTriggers(message.guild.id)
        );

        for (let i = 0; i < guildMessageTriggers.length; i++) {
            const trigger = guildMessageTriggers[i][0];
            const response = guildMessageTriggers[i][1];
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
