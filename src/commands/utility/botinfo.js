const { Command } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const { Message, EmbedBuilder, time, TimestampStyles } = require('discord.js');
const packageInfo = require(`${process.cwd()}/package.json`);
const formatter = new DurationFormatter();

class BotInfoCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'botinfo',
            description: 'Shows you information about the bot.',
            aliases: ['info', 'stats', 'botdetails'],
            preconditions: ['CmdCh'],
        });
    }

    /**
     *
     * @param { Message } message
     */
    async messageRun(message) {
        const processMem = process.memoryUsage();
        const redisInfo = await this.container.redis.info();
        const redisMem = redisInfo.slice(
            redisInfo.indexOf('used_memory_rss_human') + 22,
            redisInfo.indexOf('used_memory_rss_human') + 26
        );

        if (!this.container.client.application.owner)
            await this.container.client.application.fetch();
        const dev = this.container.client.application.owner.members.first();

        const info = new EmbedBuilder()
            .setTitle('Bot Information')
            .setFooter({
                text: `${this.container.client.user.tag}`,
                iconURL: this.container.client.user.displayAvatarURL(),
            })
            .setColor('Random')
            .addFields(
                {
                    name: 'Bot Version',
                    value: packageInfo.version,
                    inline: true,
                },
                { name: 'Developer', value: dev.user.tag },
                {
                    name: 'Memory Usage(RSS)',
                    value: `\`${(processMem.rss / 1024 / 1024).toFixed(
                        3
                    )} MiB\``,
                    inline: true,
                },
                {
                    name: 'Memory Usage(Heap)',
                    value: `\`${(processMem.heapUsed / 1024 / 1024).toFixed(
                        3
                    )} MiB\``,
                    inline: true,
                },
                {
                    name: 'Redis Memory Usage',
                    value: `\`${redisMem} MiB\``,
                    inline: true,
                },
                {
                    name: 'Postgres Driver Version',
                    value: `\`${this.container.db.typeorm.driver.version}\``,
                    inline: true,
                },
                {
                    name: 'Current Cached Users',
                    value: `${this.container.client.users.cache.size}`,
                    inline: true,
                },
                {
                    name: 'Bot Uptime',
                    value: `${formatter.format(
                        this.container.client.uptime
                    )} (since ${time(
                        new Date(Date.now() - this.container.client.uptime),
                        TimestampStyles.RelativeTime
                    )})`,
                    inline: true,
                }
            );
        return message.reply({ embeds: [info] });
    }
}

module.exports = { BotInfoCommand };
