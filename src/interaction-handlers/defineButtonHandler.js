const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const {
    ButtonInteraction,
    EmbedBuilder,
    Colors,
    MessageFlags,
} = require('discord.js');

const WORDS_API_HOST = 'wordsapiv1.p.rapidapi.com';
const WORDS_API_BASE = `https://${WORDS_API_HOST}/words`;

const fetchOptions = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
        'X-RapidAPI-Host': WORDS_API_HOST,
    },
};

const formatNumberedList = (items, emptyText) => {
    if (!items || items.length === 0) return emptyText;
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
};

const wordsApiUrl = (word, endpoint) =>
    `${WORDS_API_BASE}/${encodeURIComponent(word)}/${endpoint}`;

const fetchJson = async (url) => {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
};

const fetchPronunciationAudio = async (word) => {
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
            word
        )}`
    );

    if (!response.ok) return [];

    const data = await response.json().catch(() => []);
    const phonetics = data?.[0]?.phonetics || [];
    const audioUrls = phonetics
        .filter((phonetic) => phonetic.audio)
        .map((phonetic) => phonetic.audio);

    return [...new Set(audioUrls)];
};

const parseDefineCustomId = (customId) => {
    if (!customId.startsWith('define:')) return null;
    const payload = customId.slice('define:'.length);
    const [action, word] = payload.split('_');
    if (!action || !word) return null;
    return { action, word };
};

class DefineButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        const parsed = parseDefineCustomId(interaction.customId);
        if (!parsed) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription('Invalid dictionary action.'),
                ],
            });
            return;
        }

        if (!process.env.WORDSAPI_KEY) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(
                            'WordsAPI key is not configured. Contact the developer.'
                        ),
                ],
            });
            return;
        }

        const { action, word } = parsed;

        try {
            const handlers = {
                examples: async () => {
                    const data = await fetchJson(wordsApiUrl(word, 'examples'));
                    const embed = new EmbedBuilder()
                        .setTitle(`Examples: ${word}`)
                        .setDescription(
                            formatNumberedList(
                                data.examples,
                                'No examples listed.'
                            )
                        )
                        .setColor('Random');

                    await interaction.editReply({ embeds: [embed] });
                },
                synonyms: async () => {
                    const data = await fetchJson(wordsApiUrl(word, 'synonyms'));
                    const embed = new EmbedBuilder()
                        .setTitle(`Synonyms: ${word}`)
                        .setDescription(
                            formatNumberedList(
                                data.synonyms,
                                'No synonyms listed.'
                            )
                        )
                        .setColor('Random');

                    await interaction.editReply({ embeds: [embed] });
                },
                antonyms: async () => {
                    const data = await fetchJson(wordsApiUrl(word, 'antonyms'));
                    const embed = new EmbedBuilder()
                        .setTitle(`Antonyms: ${word}`)
                        .setDescription(
                            formatNumberedList(
                                data.antonyms,
                                'No antonyms listed.'
                            )
                        )
                        .setColor('Random');

                    await interaction.editReply({ embeds: [embed] });
                },
                similarwords: async () => {
                    const data = await fetchJson(
                        wordsApiUrl(word, 'similarTo')
                    );
                    const description =
                        data.similarTo && data.similarTo.length > 0
                            ? `These words are similar to ${word}:\n${data.similarTo.join(', ')}`
                            : 'No similar words listed.';
                    const embed = new EmbedBuilder()
                        .setTitle(`Similar Words: ${word}`)
                        .setDescription(description)
                        .setColor('Random');

                    await interaction.editReply({ embeds: [embed] });
                },
                pronunciation: async () => {
                    const data = await fetchJson(
                        wordsApiUrl(word, 'pronunciation')
                    );

                    const pronunciations = [];
                    if (typeof data.pronunciation === 'string') {
                        pronunciations.push(data.pronunciation);
                    } else if (
                        data.pronunciation &&
                        typeof data.pronunciation === 'object'
                    ) {
                        pronunciations.push(
                            ...Object.entries(data.pronunciation).map(
                                ([key, value]) => `Type: ${key} - ${value}`
                            )
                        );
                    }

                    const pronunciationAudios =
                        await fetchPronunciationAudio(word);
                    const descriptionParts = [
                        pronunciations.length > 0
                            ? pronunciations.join('\n')
                            : 'No text pronunciation listed.',
                        pronunciationAudios.length > 0
                            ? `${pronunciationAudios.length} audio pronunciation${pronunciationAudios.length === 1 ? ' is' : 's are'} available, they are attached to this message (a maximum of three will be attached).`
                            : 'No audio pronunciations available for this word.',
                    ];

                    const embed = new EmbedBuilder()
                        .setTitle(`Pronunciations: ${word}`)
                        .setDescription(descriptionParts.join('\n\n'))
                        .setColor('Random');

                    await interaction.editReply({
                        embeds: [embed],
                        files: pronunciationAudios.slice(0, 3),
                    });
                },
                frequency: async () => {
                    const data = await fetchJson(
                        wordsApiUrl(word, 'frequency')
                    );
                    const description =
                        data.frequency && data.frequency.zipf
                            ? `How common \`${word}\` is in the english language (1 to 7): ${data.frequency.zipf}`
                            : 'Frequency data not available.';
                    const embed = new EmbedBuilder()
                        .setTitle(`Frequency: ${word}`)
                        .setDescription(description)
                        .setColor('Random');

                    await interaction.editReply({ embeds: [embed] });
                },
            };

            const handler = handlers[action];
            if (!handler) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription('Unknown dictionary action.'),
                    ],
                });
                return;
            }

            await handler();
        } catch (error) {
            console.error('Dictionary Button Error:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(
                            'An error occurred while fetching that data. The API might be down or missing this specific sub request. Contact the developer if this is an issue.'
                        ),
                ],
            });
        }
    }

    async parse(interaction) {
        if (!interaction.customId.startsWith('define:')) return this.none();

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        return this.some();
    }
}

module.exports = { DefineButtonHandler };
