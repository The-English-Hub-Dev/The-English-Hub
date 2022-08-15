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

        const englishLevelButtons = new MessageActionRow().addComponents(
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

        const englishDialectEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992756666359631892/banner1.png'
            )
            .setTitle('English Dialect');
        const englishDialectButtons1 = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-englishdialect-british english')
                .setEmoji('🇬🇧')
                .setLabel('British English')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishdialect-american english')
                .setEmoji('🇺🇲')
                .setLabel('American English')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishdialect-canadian english')
                .setEmoji('🇨🇦')
                .setLabel('Canadian English')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishdialect-australian english')
                .setEmoji('🇦🇺')
                .setLabel('Australian English')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishdialect-new zealand english')
                .setEmoji('🇳🇿')
                .setLabel('New Zealand English')
                .setStyle('SECONDARY')
        );

        const englishDialectButtons2 = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-englishdialect-indian english')
                .setEmoji('🇮🇳')
                .setLabel('Indian English')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('role-englishdialect-south african english')
                .setEmoji('🇿🇦')
                .setLabel('South African English')
                .setStyle('SECONDARY')
        );

        const englishClassesEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992754077601632276/english_classes.png'
            )
            .setTitle('English Classes');
        const englishClassesButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-english classes')
                .setEmoji('📚')
                .setLabel('English Classes')
                .setStyle('SECONDARY')
        );

        const correctmeEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992755038323740762/sample_5_1.png'
            )
            .setTitle('Correct Me');
        const correctmeButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-correct me')
                .setEmoji('📝')
                .setLabel('Correct Me')
                .setStyle('SECONDARY')
        );

        const debateClubEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992755738357268500/event_sample_2.png'
            )
            .setTitle('Debate Club');
        const debateClubButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-debate club')
                .setEmoji('🗣️')
                .setLabel('Debate Club')
                .setStyle('SECONDARY')
        );

        const wotdEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992759152734634065/WOTD.png'
            )
            .setTitle('Word of the Day');
        const wotdButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-wotd')
                .setEmoji('📚')
                .setLabel('Word of the Day')
                .setStyle('SECONDARY')
        );

        const bookClubEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992759572932595732/book_club.png'
            )
            .setTitle('Book Club');
        const bookClubButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('role-book club')
                .setEmoji('📑')
                .setLabel('Book Club')
                .setStyle('SECONDARY')
        );

        const notificationEmbed = new MessageEmbed()
            .setImage(
                'https://media.discordapp.net/attachments/917885921423134741/992760055575363684/IMG_20220630_124606.jpg'
            )
            .setTitle('Notifications');
        const notificationButtons = new MessageActionRow().addComponents();
        // TODO notification buttons

        await channel.send({
            embeds: [continentEmbed],
            components: [continentButtons],
        });
        await channel.send({
            embeds: [englishLevelEmbed],
            components: [englishLevelButtons],
        });
        await channel.send({
            embeds: [englishDialectEmbed],
            components: [englishDialectButtons1, englishDialectButtons2],
        });
        await channel.send({
            embeds: [englishClassesEmbed],
            components: [englishClassesButton],
        });
        await channel.send({
            embeds: [correctmeEmbed],
            components: [correctmeButton],
        });
        await channel.send({
            embeds: [debateClubEmbed],
            components: [debateClubButton],
        });
        await channel.send({
            embeds: [wotdEmbed],
            components: [wotdButton],
        });
        await channel.send({
            embeds: [bookClubEmbed],
            components: [bookClubButton],
        });
        await channel.send({
            embeds: [notificationEmbed],
            components: [notificationButtons],
        });
    }
}

module.exports = { SendButtonRoleEmbedsCommand };
