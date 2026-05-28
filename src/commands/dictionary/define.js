const { Command, Args } = require('@sapphire/framework');
const {
    Message,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    blockQuote,
} = require('discord.js');
const overridenDefinitions = {
    'bow tie':
        'That guy in the server with some abnormal fascination of all things related to bow ties. Chatterbox, biscuit lover and drinker of tea.',
    vivek: 'He is a very charming dude that hangs out here. Always down for a game of chess. Has a desire to post random emojis.',
};

class DefineCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'define',
            description: 'Defines a word in english for you.',
            usage: '<word type: String>',
            aliases: ['def', 'dword', 'wordinfo'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     */
    async messageRun(message, args) {
        const rawWord = await args.restResult('string');
        if (rawWord.isErr())
            return this.container.utility.errReply(
                message,
                'You must provide a word to define.'
            );

        let word = rawWord.unwrap();

        await message.channel.sendTyping();

        // 2. Clean the input string of weird characters
        word = word
            .trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, '');

        // 3. Encode it for the URL (leaves the display `word` variable untouched)
        const encodedWord = encodeURIComponent(word);

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

        const overrideDef = overridenDefinitions[word];
        if (overrideDef) {
            const definitionEmbed = new EmbedBuilder()
                .setTitle(`Word: ${word}`)
                .setDescription(blockQuote(`**Definition:** ${overrideDef}`))
                .setFooter({
                    text: `Definition requested by ${message.author.tag}`,
                })
                .setColor('Random');
            return message.reply({
                content: `${word == 'vivek' ? '<@1031266462272336003>' : ''}`,
                embeds: [definitionEmbed],
                allowedMentions: {
                    users: ['1031266462272336003'],
                    roles: [],
                    parse: [],
                },
                components: [defActionRow1, defActionRow2],
            });
        }

        const res = await fetch(
            `https://wordsapiv1.p.rapidapi.com/words/${encodedWord}/definitions`,
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

        if (!res.ok) {
            return message.reply(
                `:warning: The dictionary service is currently unavailable (Status: ${res.status}). Please try again later.`
            );
        }

        const resData = await res.json();
        let description = 'No definitions listed.';
        if (resData.definitions.length > 0) {
            description = `**Definition${
                resData.definitions.length > 1
                    ? ` 1 (${resData.definitions[0].partOfSpeech})`
                    : ` (${resData.definitions[0].partOfSpeech})`
            }:** ${resData.definitions[0].definition}`;
            if (resData.definitions.length > 1) {
                description += `\n**Definition 2 (${resData.definitions[1].partOfSpeech}):** ${resData.definitions[1].definition}`;
            }
            if (resData.definitions.length > 2) {
                description += `\n**Definition 3 (${resData.definitions[2].partOfSpeech}):** ${resData.definitions[2].definition}`;
            }
        }

        let hasteBinLink = null;
        if (resData.definitions.length > 2) {
            try {
                hasteBinLink = await this.container.utility.createHastebin(
                    `Definitions of ${word}\n` +
                        resData.definitions
                            .slice(3)
                            .map(
                                (def, index) =>
                                    `Definition ${index + 4} (${def.partOfSpeech}): ${
                                        def.definition
                                    }`
                            )
                            .join('\n'),
                    'txt'
                );
            } catch (error) {
                console.error('Failed to generate Hastebin:', error);
            }
        }

        if (hasteBinLink) {
            description += `\n\nOther definitions can be found [here](${hasteBinLink})`;
        } else if (resData.definitions.length > 2) {
            description += `\n\n*(More definitions exist, but the text dump service is temporarily unavailable. Try again later.)*`;
        }

        const definitionEmbed = new EmbedBuilder()
            .setTitle(`Word: ${word}`)
            .setDescription(blockQuote(description))
            .setFooter({
                text: `Definition requested by ${message.author.tag}`,
            })
            .setColor(
                description == 'No definitions listed.' ? 'Red' : 'Random'
            );

        return message.reply({
            embeds: [definitionEmbed],
            allowedMentions: { repliedUser: false },
            components: [defActionRow1, defActionRow2],
        });
    }
}
module.exports = { DefineCommand };
