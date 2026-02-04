const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const { DiscordSnowflake } = require('@sapphire/snowflake');
class QueueCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'queue',
            aliases: ['createqueue', 'create-queue'],
            description:
                'Creates or view a queue of users for use in vcs and events',
            usage: ['<id type:DiscordSnowflake>', ''],
            preconditions: ['EventManager'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const queueID = await args.restResult('string');

        let queueSnowflake = DiscordSnowflake.generate();

        if (queueID.isOk()) {
            queueSnowflake = queueID.unwrap();
        }

        const queueEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Queue')
            .setDescription(`Queue ID: ${queueSnowflake}\n\n**Users:** None`)
            .setFooter({ text: `Queue created by ${message.author.tag}` });

        const queueActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId(`queue:join_${queueSnowflake}`)
                .setLabel('Join')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`queue:leave_${queueSnowflake}`)
                .setLabel('Leave')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`queue:clear_${queueSnowflake}`)
                .setLabel('Clear')
                .setStyle(ButtonStyle.Secondary),
        ]);

        const m = await message.channel.send({
            embeds: [queueEmbed],
            components: [queueActionRow],
        });

        if (queueID.isOk()) {
            const oldEmbed = m.embeds[0];
            const currentQueueUsersIDs = await this.container.redis.lrange(
                `queue_${queueID.unwrap()}`,
                0,
                -1
            );
            const currentQueueUsers = currentQueueUsersIDs
                .map(
                    (id, index) =>
                        `${currentQueueUsersIDs.length - index}: <@${id}>`
                )
                .reverse()
                .join('\n');

            const newEmbed = new EmbedBuilder()
                .setColor('Random')
                .setTitle(oldEmbed.title)
                .setDescription(
                    `Queue ID: ${queueSnowflake}\n\n**${currentQueueUsersIDs.length} User${
                        currentQueueUsersIDs.length > 1 ? 's' : ''
                    } in queue:**\n ${
                        currentQueueUsers.length > 0
                            ? currentQueueUsers
                            : 'None'
                    }`
                )
                .setFooter(oldEmbed.footer);
            await m.edit({ embeds: [newEmbed] });
            return message
                .reply('Queue restored from ID!')
                .then((m) =>
                    setTimeout(() => m.delete().catch(() => {}), 5000)
                );
        }

        await message
            .reply('Queue created!')
            .then((m) => setTimeout(() => m.delete().catch(() => {}), 5000));

        return true;
    }
}

module.exports = { QueueCommand };
