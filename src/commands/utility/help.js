const { Command, Args } = require('@sapphire/framework');
const { isNullOrUndefinedOrEmpty } = require('@sapphire/utilities');
const { Message, EmbedBuilder, Colors, blockQuote } = require('discord.js');
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
     * Check if a user can use a command by testing its preconditions
     * @param { Message } message
     * @param { Command } cmd
     * @returns { Promise<boolean> }
     */
    async canUserUseCommand(message, cmd) {
        // If command has no preconditions, user can use it
        if (!cmd.preconditions || cmd.preconditions.length === 0) {
            return true;
        }

        // Test each precondition
        for (const precondition of cmd.preconditions) {
            // Handle array of preconditions (OR logic)
            if (Array.isArray(precondition)) {
                for (const prec of precondition) {
                    const result = await this.container.stores
                        .get('preconditions')
                        .get(prec)
                        ?.messageRun(message);
                    if (result?.isOk()) return true;
                }
            } else {
                // Single precondition
                const result = await this.container.stores
                    .get('preconditions')
                    .get(precondition)
                    ?.messageRun(message);
                if (!result?.isOk()) return false;
            }
        }

        return true;
    }

    /**
     * @param { Message } message
     * @param { Args } args
     * @returns { Promise<void> }
     */
    async messageRun(message, args) {
        const commandsData = [];
        const allCommands = this.container.stores.get('commands');
        const command = await args.pickResult('string');

        if (command.isErr()) {
            // Show all available commands for the user
            const categories = allCommands.categories;
            const categoryCommands = new Array(categories.length);

            // Filter commands based on user permissions
            for (const cmd of allCommands.values()) {
                if (!cmd.enabled) continue;

                const canUse = await this.canUserUseCommand(message, cmd);
                if (!canUse) continue;

                const cmdCategory = cmd.category;
                if (cmdCategory) {
                    const categoryIndex = categories.indexOf(cmdCategory);
                    if (
                        isNullOrUndefinedOrEmpty(
                            categoryCommands[categoryIndex]
                        )
                    ) {
                        categoryCommands[categoryIndex] = [cmd.name];
                    } else {
                        categoryCommands[categoryIndex].push(cmd.name);
                    }
                }
            }

            // Build embed fields
            const fields = [];
            for (let i = 0; i < categories.length; i++) {
                if (isNullOrUndefinedOrEmpty(categoryCommands[i])) continue;
                fields.push({
                    name: `${categories[i].charAt(0).toUpperCase()}${categories[i].slice(1)}`,
                    value: categoryCommands[i].join(', '),
                });
            }

            const visibleCommandCount = fields.reduce(
                (sum, field) => sum + field.value.split(', ').length,
                0
            );

            const helpEmbed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('Help')
                .setFooter({
                    text: `${visibleCommandCount} available commands. Use ${prefix}help [command] for details`,
                })
                .addFields(fields);

            return message.reply({ embeds: [helpEmbed] });
        }

        // Show help for specific command
        const commandName = command.unwrap();
        const cmd = allCommands.get(commandName);

        if (!cmd) {
            return message.reply(
                `No help found for command \`${commandName}\``
            );
        }

        // Check if user can use this command
        const canUse = await this.canUserUseCommand(message, cmd);
        if (!canUse) {
            return message.reply(
                `You don't have permission to use the \`${commandName}\` command.`
            );
        }

        commandsData.push(`**Name:** ${cmd.name}\n`);

        if (cmd.aliases.length) {
            commandsData.push(` **Aliases:** ${cmd.aliases.join(', ')}\n`);
        }

        if (cmd.description) {
            commandsData.push(` **Description:** ${cmd.description}\n`);
        }

        if (cmd.options.usage) {
            commandsData.push(
                ` **Usage:** ${prefix}${cmd.name} ${
                    Array.isArray(cmd.options.usage)
                        ? cmd.options.usage.join(', ')
                        : cmd.options.usage
                }\n`
            );
        }

        if (cmd.options.flags) {
            commandsData.push(` **Flags:** ${cmd.options.flags.join(', ')}\n`);
        }

        if (cmd.options.options) {
            commandsData.push(
                ` **Options:** ${cmd.options.options.join(', ')}\n`
            );
        }

        if (cmd.options.subCommands) {
            const subCmds = [];
            subCmds.push(`**Subcommands:**`);
            cmd.options.subCommands.forEach((subCmd) => {
                if (typeof subCmd === 'string') {
                    subCmds.push(`${subCmd}`);
                } else {
                    subCmds.push(`${subCmd.input}\n`);
                }
            });
            commandsData.push(subCmds.join(', '));
        }

        if (cmd.preconditions && cmd.preconditions.length > 0) {
            commandsData.push(
                `**Permissions:** ${cmd.preconditions.join(', ')}\n`
            );
        }

        if (!cmd.enabled) {
            commandsData.push(`*This command is disabled*\n`);
        }

        const commandsDataString = commandsData.join(' ');
        const commandHelpEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`Help: ${cmd.name}`)
            .setDescription(blockQuote(commandsDataString));

        return message.reply({ embeds: [commandHelpEmbed] });
    }
}

module.exports = { HelpCommand };
