const { Command } = require('@sapphire/framework');
const { DurationFormatter } = require('@sapphire/time-utilities');
const { Message, MessageEmbed } = require('discord.js');
const packageInfo = require(`${process.cwd()}/package.json`);
const formatter = new DurationFormatter();

class BotInfoCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'botinfo',
            description: 'Shows you information about the bot.',
            aliases: ['info', 'stats', 'botdetails'],
            preconditions: ['Staff'],
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
        const dev = this.container.client.application.owner;

        const info = new MessageEmbed()
            .setTitle('Bot Information')
            .setFooter({
                text: `${this.container.client.user.tag}`,
                iconURL: this.container.client.user.displayAvatarURL(),
            })
            .setColor('RANDOM')
            .addField('Bot Version', packageInfo.version, true)
            .addField('Developer', dev.tag)
            .addField(
                'Memory Usage(RSS)',
                `\`${(processMem.rss / 1024 / 1024).toFixed(3)} MiB\``,
                true
            )
            .addField(
                'Memory Usage(Heap)',
                `\`${(processMem.heapUsed / 1024 / 1024).toFixed(3)} MiB\``,
                true
            )
            .addField('Redis Memory Usage', `\`${redisMem} MiB\``, true)
            .addField(
                'Current Cached Users',
                `${this.container.client.users.cache.size}`,
                true
            )
            .addField(
                'Bot Uptime',
                `${formatter.format(this.container.client.uptime)}`,
                true
            );
        return message.reply({ embeds: [info] });
    }
}

module.exports = { BotInfoCommand };
