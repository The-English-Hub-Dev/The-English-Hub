const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

class SendGoldenmicrophoneAppCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'sendgoldenmicrophoneapp',
            description: "Set's the bots status.",
            aliases: [
                'sendgmapp',
                'sendgoldenapp',
                'sendgmapplication',
                'sendgoldenapplication',
            ],
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const gmEmbed = new EmbedBuilder()
            .setTitle('Golden Microphone Application')
            .setDescription(
                "Role description: it allows you to bypass voice channels limit and you'll be able to participate in premium giveaways. You can apply for this role if you're in the list of Top 20 voice members on the last 14 days basis. No past infractions. "
            )
            .setColor(0xffd700)
            .setFooter({
                text: `Golden Microphone Application - ${message.guild.name}`,
            });

        const gmActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId('goldenmic:modal_request')
                .setLabel('Apply')
                .setStyle(ButtonStyle.Success),
        ]);

        return message.channel.send({
            embeds: [gmEmbed],
            components: [gmActionRow],
        });
    }
}

module.exports = { SendGoldenmicrophoneAppCommand };
