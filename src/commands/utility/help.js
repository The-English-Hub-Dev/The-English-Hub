const { Command, Args } = require('@sapphire/framework');
const { isNullOrUndefinedOrEmpty } = require('@sapphire/utilities');
const {
    Message,
    EmbedBuilder,
    APIEmbedField,
    Colors,
    blockQuote,
} = require('discord.js');
const { prefix } = require('../../../config.json');
class HelpCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'help',
            aliases: ['cmds'],
            description: 'Shows you all the commands on the bot',
            preconditions: ['Staff'],
        });
    }

    /**
     *
     * @param { Message } message
     * @param { Args } args
     * @returns
     */
    async messageRun(message, args) {
        const commandsData = [];
        let commands = this.container.stores.get('commands');
        const command = await args.pickResult('string');

        if (command.isErr()) {
            const helpEmbed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('Help')
                .setFooter({
                    text: `${
                        this.container.stores.get('commands').size - 1
                    } total commands. Use ${prefix}help [command] to get information on a specific command`,
                });
            let categories = [];
            if (!this.container.client.application.owner)
                await this.container.client.application.fetch();
            for (
                var x = 0;
                x < this.container.stores.get('commands').categories.length;
                x++
            ) {
                categories.push(
                    this.container.stores.get('commands').categories[x]
                );
            }

            let categoryCommands = new Array(categories.length);
            if (message.author != this.container.client.application.owner)
                commands = commands.filter((c) => c.category != 'developer');

            commands.forEach((cmd) => {
                const cmdCategory = cmd.category;
                if (cmdCategory && cmd) {
                    if (
                        isNullOrUndefinedOrEmpty(
                            categoryCommands[categories.indexOf(cmdCategory)]
                        )
                    ) {
                        categoryCommands[categories.indexOf(cmdCategory)] =
                            new Array([cmd.name]);
                    } else {
                        categoryCommands[categories.indexOf(cmdCategory)].push(
                            cmd.name
                        );
                    }
                }
            });
            const fields = [];
            for (var i = 0; i < categories.length; i++) {
                if (isNullOrUndefinedOrEmpty(categoryCommands[i])) continue;
                fields.push({
                    name: `${categories[i].charAt(0).toUpperCase()}${categories[
                        i
                    ].slice(1)}`,
                    value: categoryCommands[i].join(', '),
                });
            }
            helpEmbed.addFields(fields);

            return message.reply({ embeds: [helpEmbed] });
        }

        let cmd = null;
        if (!this.container.stores.get('commands').get(command.unwrap())) {
            return message.reply(
                `No help found for command \`${command.unwrap()}\``
            );
        } else {
            cmd = this.container.stores.get('commands').get(command.unwrap());
        }
        commandsData.push(`**Name:** ${cmd.name}\n`);

        if (cmd.aliases.length)
            commandsData.push(` **Aliases:** ${cmd.aliases.join(', ')}\n`);
        if (cmd.description)
            commandsData.push(` **Description:** ${cmd.description}\n`);
        if (cmd.options.usage)
            commandsData.push(
                ` **Usage:** ${prefix}${cmd.name} ${cmd.options.usage}\n`
            );
        if (cmd.options.flags)
            commandsData.push(` **Flags:** ${cmd.options.flags.join(', ')}\n`);
        if (cmd.options.options)
            commandsData.push(
                ` **Options:** ${cmd.options.options.join(', ')}\n`
            );

        if (cmd.options.subCommands) {
            const subCmds = [];
            subCmds.push(`**Subcommands:**`);
            cmd.options.subCommands.forEach((subCmd) => {
                if (typeof subCmd === 'string') {
                    subCmds.push(`${subCmd}`);
                } else subCmds.push(`${subCmd.input}\n`);
            });
            commandsData.push(subCmds.join(', '));
        }
        if (cmd.preconditions.entries.length)
            commandsData.push(
                `**Permissions:** ${cmd.options.preconditions.join(', ')}\n`
            );
        if (!cmd.enabled) commandsData.push(`*This command is disabled*\n`);
        const commandsDataString = commandsData.join(' ');
        const commandHelpEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`Help: ${cmd.name}`)
            .setDescription(blockQuote(commandsDataString));
        return message.reply({ embeds: [commandHelpEmbed] });
    }
}

module.exports = { HelpCommand };
