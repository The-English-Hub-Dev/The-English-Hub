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

class DefineButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        const [action, word] = interaction.customId.split(':')[1].split('_');

        // Reusable fetch configuration
        const fetchOptions = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
            },
        };

        try {
            switch (action) {
                case 'examples': {
                    const eRes = await fetch(
                        `https://wordsapiv1.p.rapidapi.com/words/${word}/examples`,
                        fetchOptions
                    );
                    const eData = await eRes.json();

                    const eEmbed = new EmbedBuilder()
                        .setTitle(`Examples: ${word}`)
                        .setDescription(
                            eData.examples && eData.examples.length > 0
                                ? eData.examples
                                      .map(
                                          (item, index) =>
                                              `${index + 1}. ${item}`
                                      )
                                      .join('\n')
                                : 'No examples listed.'
                        )
                        .setColor('Random');
                    await interaction.editReply({ embeds: [eEmbed] });
                    break;
                }
                case 'synonyms': {
                    const sRes = await fetch(
                        `https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`,
                        fetchOptions
                    );
                    const sData = await sRes.json();

                    const sEmbed = new EmbedBuilder()
                        .setTitle(`Synonyms: ${word}`)
                        .setDescription(
                            sData.synonyms && sData.synonyms.length > 0
                                ? sData.synonyms
                                      .map(
                                          (item, index) =>
                                              `${index + 1}. ${item}`
                                      )
                                      .join('\n')
                                : 'No synonyms listed.'
                        )
                        .setColor('Random');
                    await interaction.editReply({ embeds: [sEmbed] });
                    break;
                }
                case 'antonyms': {
                    const aRes = await fetch(
                        `https://wordsapiv1.p.rapidapi.com/words/${word}/antonyms`,
                        fetchOptions
                    );
                    const aData = await aRes.json();

                    const aEmbed = new EmbedBuilder()
                        .setTitle(`Antonyms: ${word}`)
                        .setDescription(
                            aData.antonyms && aData.antonyms.length > 0
                                ? aData.antonyms
                                      .map(
                                          (item, index) =>
                                              `${index + 1}. ${item}`
                                      )
                                      .join('\n')
                                : 'No antonyms listed.'
                        )
                        .setColor('Random');
                    await interaction.editReply({ embeds: [aEmbed] });
                    break;
                }
                case 'similarwords': {
                    const simRes = await fetch(
                        `https://wordsapiv1.p.rapidapi.com/words/${word}/similarTo`,
                        fetchOptions
                    );
                    const simData = await simRes.json();

                    const simEmbed = new EmbedBuilder()
                        .setTitle(`Similar Words: ${word}`)
                        .setDescription(
                            simData.similarTo && simData.similarTo.length > 0
                                ? `These words are similar to ${word}:\n ${simData.similarTo.join(', ')}`
                                : 'No similar words listed.'
                        )
                        .setColor('Random');
                    await interaction.editReply({ embeds: [simEmbed] });
                    break;
                }
                case 'pronunciation': {
                    // Fetch WordsAPI data
                    const pRes = await fetch(
                        `https://wordsapiv1.p.rapidapi.com/words/${word}/pronunciation`,
                        fetchOptions
                    );
                    const pData = await pRes.json();

                    const pronunciations = pData.pronunciation
                        ? Object.entries(pData.pronunciation).map(
                              ([key, value]) => `Type: ${key} - ${value}`
                          )
                        : [];

                    const pronounciationAudioRaw = await fetch(
                        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
                    );

                    let pronunciationAudios = [];

                    // Safely handle 404s from the secondary API
                    if (pronounciationAudioRaw.ok) {
                        const audioData = await pronounciationAudioRaw.json();
                        const phonetics = audioData[0]?.phonetics || [];

                        for (const phonetic of phonetics) {
                            if (phonetic.audio) {
                                pronunciationAudios.push(phonetic.audio);
                            }
                        }
                    }

                    const pEmbed = new EmbedBuilder()
                        .setTitle(`Pronunciations: ${word}`)
                        .setDescription(
                            `${pronunciations.length > 0 ? pronunciations.join('\n') : 'No text pronunciation listed.'}\n\n${
                                pronunciationAudios.length > 0
                                    ? `${pronunciationAudios.length} audio pronunciation${pronunciationAudios.length === 1 ? ' is' : 's are'} available, they are attached to this message (a maximum of three will be attached).`
                                    : 'No audio pronunciations available for this word.'
                            }`
                        )
                        .setColor('Random');

                    await interaction.editReply({
                        embeds: [pEmbed],
                        files: pronunciationAudios.slice(0, 3),
                    });
                    break;
                }
                case 'frequency': {
                    const fRes = await fetch(
                        `https://wordsapiv1.p.rapidapi.com/words/${word}/frequency`,
                        fetchOptions
                    );
                    const fData = await fRes.json();

                    const fEmbed = new EmbedBuilder()
                        .setTitle(`Frequency: ${word}`)
                        .setDescription(
                            fData.frequency && fData.frequency.zipf
                                ? `How common \`${word}\` is in the english language (1 to 7): ${fData.frequency.zipf}`
                                : 'Frequency data not available.'
                        )
                        .setColor('Random');

                    await interaction.editReply({ embeds: [fEmbed] });
                    break;
                }
            }
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
