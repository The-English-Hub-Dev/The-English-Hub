const { Command } = require('@sapphire/framework');
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
            description: 'Creates a queue of users for use in vcs and events',
            preconditions: ['NotOrigCmdChannel', 'EventManager'],
        });
    }

    /**
     *
     * @param { Message } message
     * @returns
     */
    async messageRun(message) {
        const queueSnowflake = DiscordSnowflake.generate();

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

        await message.channel.send({
            embeds: [queueEmbed],
            components: [queueActionRow],
        });

        message
            .reply('Queue created!')
            .then((m) => setTimeout(() => m.delete(), 5000));

        return true;
    }
}

module.exports = { QueueCommand };
