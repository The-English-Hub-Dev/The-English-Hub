const { SapphireClient, container } = require('@sapphire/framework');
const Sentry = require('@sentry/node');
const { Intents, Options } = require('discord.js');
require('@sapphire/plugin-logger/register');
const { prefix } = require('../config.json');

process.on('uncaughtException', (error) => {
	container.logger.error(error);
});

const client = new SapphireClient({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS],
	defaultPrefix: prefix,
	loadMessageCommandListeners: true,
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
});

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	tracesSampleRate: 1.0,
	integrations: [new Sentry.Integrations.Http({tracing: true})]
});

client.login(process.env.DISCORD_TOKEN);