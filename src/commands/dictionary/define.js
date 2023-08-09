const { Command, Args } = require('@sapphire/framework');
const { Message, EmbedBuilder } = require('discord.js');

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

        const data = await fetch({
            method: 'GET',
            url: `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`,
            headers: {
                'X-RapidAPI-Key': process.env.WORDSAPI_KEY,
                'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
            },
        });

        if (data.status == '404') {
            return message.reply(
                `:x: That word could not be found in the dictionary.`
            );
        }

        let description = `**Definition:** ${data.body.definitions[0].definition}`;
        if (data.body.definitions.length > 1) {
            description += `\n**Alternate Definiton:** ${data.body.definitions[1].definition}`;
        }

        const hasteBinLink = this.container.utility.createHastebin(
            data.body.definitions
                .map((def) => def.definition)
                .slice(1)
                .join('\n')
        );

        if (data.body.definitions.length > 2) {
            description += `\nOther definitions can be found here: ${hasteBinLink}`;
        }

        const definitionEmbed = new EmbedBuilder()
            .setTitle(`Definition for ${word}`)
            .setDescription(description)
            .setFooter({
                text: `Definition requested by ${message.author.tag}`,
            })
            .setColor('RANDOM');

        return message.reply({
            embeds: [definitionEmbed],
            allowedMentions: { repliedUser: false },
        });
    }
}
module.exports = { DefineCommand };
