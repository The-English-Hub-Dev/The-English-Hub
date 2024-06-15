const {
    InteractionHandler,
    InteractionHandlerTypes,
} = require('@sapphire/framework');
const { ButtonInteraction, EmbedBuilder, Colors } = require('discord.js');

class DefineButtonHandler extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async run(interaction) {
        const word = interaction.customId.split(':')[1].split('_')[1];
        const wordFetch = await fetch(
            `https://wordsapiv1.p.rapidapi.com/words/${word}`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                },
            }
        );
        if (wordFetch.status == '404') {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setDescription(
                            `Word does not exist in dictionary. A custom definition was added for ${word}.`
                        )
                        .setTitle('Word does not exist'),
                ],
            });
        }

        switch (interaction.customId.split(':')[1].split('_')[0]) {
            case 'examples':
                const eRes = await fetch(
                    `https://wordsapiv1.p.rapidapi.com/words/${word}/examples`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                        },
                    }
                );
                const eData = await eRes.json();
                const eEmbed = new EmbedBuilder()
                    .setTitle(`Examples: ${word}`)
                    .setDescription(
                        eData.examples.length > 0
                            ? eData.examples
                                  .map((item, index) => `${index + 1}. ${item}`)
                                  .join('\n')
                            : 'No examples listed.'
                    )
                    .setColor('Random');
                await interaction.editReply({ embeds: [eEmbed] });
                break;
            case 'synonyms':
                const sRes = await fetch(
                    `https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                        },
                    }
                );
                const sData = await sRes.json();
                const sEmbed = new EmbedBuilder()
                    .setTitle(`Synonyms: ${word}`)
                    .setDescription(
                        sData.synonyms.length > 0
                            ? sData.synonyms
                                  .map((item, index) => `${index + 1}. ${item}`)
                                  .join('\n')
                            : 'No synonyms listed.'
                    )
                    .setColor('Random');
                await interaction.editReply({ embeds: [sEmbed] });
                break;
            case 'antonyms':
                const aRes = await fetch(
                    `https://wordsapiv1.p.rapidapi.com/words/${word}/antonyms`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                        },
                    }
                );
                const aData = await aRes.json();
                const aEmbed = new EmbedBuilder()
                    .setTitle(`Antonyms: ${word}`)
                    .setDescription(
                        aData.antonyms.length > 0
                            ? aData.antonyms
                                  .map((item, index) => `${index + 1}. ${item}`)
                                  .join('\n')
                            : 'No antonyms listed.'
                    )
                    .setColor('Random');
                await interaction.editReply({ embeds: [aEmbed] });
                break;
            case 'similarwords':
                const simRes = await fetch(
                    `https://wordsapiv1.p.rapidapi.com/words/${word}/similarTo`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                        },
                    }
                );
                const simData = await simRes.json();
                const simEmbed = new EmbedBuilder()
                    .setTitle(`Similar Words: ${word}`)
                    .setDescription(
                        simData.similarTo.length > 0
                            ? `These words are similar to ${word}:\n ${simData.similarTo.join(
                                  ', '
                              )}`
                            : 'No similar words listed.'
                    )
                    .setColor('Random');
                await interaction.editReply({ embeds: [simEmbed] });
                break;
            case 'pronunciation':
                const pRes = await fetch(
                    `https://wordsapiv1.p.rapidapi.com/words/${word}/pronunciation`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                        },
                    }
                );
                const pData = await pRes.json();
                const pronunciations = Object.entries(pData.pronunciation).map(
                    ([key, value]) => `Type: ${key} - ${value}`
                );

                const pronounciationAudioRaw = await fetch(
                    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
                );

                const phonetics = (await pronounciationAudioRaw.json())[0]
                    .phonetics;
                let pronunciationAudios = [];
                if (phonetics.length > 0) {
                    for (let x = 0; x < phonetics.length; x++) {
                        const phonetic = phonetics[x];
                        if (phonetic.audio && phonetic.audio.length)
                            pronunciationAudios.push(phonetic.audio);
                    }
                }

                const pEmbed = new EmbedBuilder()
                    .setTitle(`Pronunciations: ${word}`)
                    .setDescription(
                        `${pronunciations.join('\n')}\n\n${
                            pronunciationAudios.length > 0
                                ? `${
                                      pronunciationAudios.length
                                  } audio pronunciation${
                                      pronunciationAudios.length == 1
                                          ? ' is'
                                          : 's are'
                                  } available, they are attached to this message (a maximum of three will be attached).`
                                : 'No audio pronunciations available for this word.'
                        }`
                    )
                    .setColor('Random');
                await interaction.editReply({
                    embeds: [pEmbed],
                    files: pronunciationAudios.slice(0, 3),
                });
                break;
            case 'frequency':
                const fRes = await fetch(
                    `https://wordsapiv1.p.rapidapi.com/words/${word}/frequency`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                        },
                    }
                );
                const fData = await fRes.json();
                const fEmbed = new EmbedBuilder()
                    .setTitle(`Frequency: ${word}`)
                    .setDescription(
                        `How common \`${word}\` is in the english language (1 to 7): ${fData.frequency.zipf}`
                    )
                    .setColor('Random');

                await interaction.editReply({ embeds: [fEmbed] });
                break;
        }
    }

    /**
     *
     * @param { ButtonInteraction } interaction
     */
    async parse(interaction) {
        if (!interaction.customId.startsWith('define:')) return this.none();
        
        await interaction.deferReply({ ephemeral: true });
        return this.some();
    }
}

module.exports = { DefineButtonHandler };
