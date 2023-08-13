const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    blockQuote,
} = require('discord.js');

class DefineCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'define',
            description: 'Defines a word in english for you.',
            usage: '[word]',
            aliases: ['dword', 'wordinfo'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawWord = await args.pickResult('string');
        if (rawWord.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a word to define.'
            );

        const word = rawWord.unwrap();

        const res = await fetch(
            `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                },
            }
        );

        if (res.status == '404') {
            return message.reply(
                `:x: That word could not be found in the dictionary.`
            );
        }

        const resData = await res.json();

        let description = `**Definition${
            resData.definitions.length > 1 ? ' 1' : ''
        }:** ${resData.definitions[0].definition}`;
        if (resData.definitions.length > 1) {
            description += `\n**Definition 2:** ${resData.definitions[1].definition}`;
        }

        const hasteBinLink = await this.container.utility.createHastebin(
            `Definitions of ${word}\n` +
                resData.definitions
                    .map((def) => def.definition)
                    .slice(1)
                    .map((index, def) => `Definition ${index + 1}: ${def}`)
                    .join('\n'),
            'txt'
        );

        if (resData.definitions.length > 2) {
            description += `\n\nOther definitions can be found [here](${hasteBinLink})`;
        }

        const definitionEmbed = new EmbedBuilder()
            .setTitle(`Word: ${word}`)
            .setDescription(blockQuote(description))
            .setFooter({
                text: `Definition requested by ${message.author.tag}`,
            })
            .setColor('Random');

        const defActionRow1 = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId(`define:examples_${word}`)
                .setLabel('Examples')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`define:synonyms_${word}`)
                .setLabel('Synonyms')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`define:antonyms_${word}`)
                .setLabel('Antonyms')
                .setStyle(ButtonStyle.Danger),
        ]);

        const defActionRow2 = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId(`define:similarwords_${word}`)
                .setLabel('Similar Words')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`define:pronunciation_${word}`)
                .setLabel('Pronunciation')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`define:frequency_${word}`)
                .setLabel('Frequency')
                .setStyle(ButtonStyle.Secondary),
        ]);

        return message.reply({
            embeds: [definitionEmbed],
            allowedMentions: { repliedUser: false },
            components: [defActionRow1, defActionRow2],
        });
    }
}
module.exports = { DefineCommand };
