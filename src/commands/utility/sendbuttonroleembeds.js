const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} = require('discord.js');

class SendButtonRoleEmbedsCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'sendbuttonroleembeds',
            aliases: ['sendbtnroleembeds'],
            description: 'Sends the embeds for button roles',
            preconditions: ['Admin'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const channel =
            (await args.pickResult('guildTextChannel')).value ??
            message.channel;

        const continentEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/991996216902680616/continents-1.png'
            )
            .setTitle('Continents');

        const continentButtons = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-continent-europe')
                .setEmoji('<:europe:817597655215636480>')
                .setLabel('Europe')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-continent-asia')
                .setEmoji('<:asia:817597815545921557>')
                .setLabel('Asia')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-continent-africa')
                .setEmoji('<:africa:817597773884162078>')
                .setLabel('Africa')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-continent-americas')
                .setEmoji('<:americas:817597725717430303>')
                .setLabel('Americas')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-continent-oceania')
                .setEmoji('<:oceania:817597603549151282>')
                .setLabel('Oceania')
                .setStyle('SECONDARY')
        );

        const englishLevelEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992752883307135076/3.png'
            )
            .setTitle('English Level');

        const englishButtons = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-englishlevel-beginner')
                .setEmoji('📕')
                .setLabel('Beginner')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishlevel-intermediate')
                .setEmoji('📗')
                .setLabel('Intermediate')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishlevel-advanced')
                .setEmoji('📙')
                .setLabel('Advanced')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishlevel-fluent')
                .setEmoji('📘')
                .setLabel('Fluent')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishlevel-native')
                .setEmoji('🔖')
                .setLabel('Native')
                .setStyle('SECONDARY')
        );

        const englishDialectEmbed  = new MessageEmbed()
            .setImage('https://media.discordapp.net/attachments/917885921423134741/992756666359631892/banner1.png')
            .setTitle('English Dialect');
        
        const englishDialectButtons = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-englishdialect-british english')
                
        )

        await message.channel.send({
            embeds: [continentEmbed],
            components: [continentButtons],
        });
        await message.channel.send({
            embeds: [englishLevelEmbed],
            components: [englishButtons],
        });
    }
}

module.exports = { SendButtonRoleEmbedsCommand };
