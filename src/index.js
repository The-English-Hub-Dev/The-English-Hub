const { SapphireClient, container } = require('@sapphire/framework');
const Sentry = require('@sentry/node');
const { GatewayIntentBits, Options, Partials } = require('discord.js');
const Redis = require('ioredis');
require('@sapphire/plugin-logger/register');
require('dotenv').config();
const { prefix, clientID } = require('../config.json');
const { Database } = require('./library/db/database');
const { Tasks } = require('./library/tasks');
const { Utility } = require('./library/utility');
const { AutomodManager } = require('./library/managers/automodManager');

process.on('uncaughtException', async (error) => {
    if (!container || !container.utility)
        await container.utility.exception(error, 'Uncaught');
    else container.logger.error(error);
});

const redis = new Redis(process.env.REDIS_URL, {});

container.redis = redis;
container.db = new Database();
container.utility = new Utility();
container.automodManager = new AutomodManager();
// container.tasks = new Tasks();

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel],
    sweepers: {
        ...Options.defaultSweeperSettings,
        guildMembers: {
            interval: 5000,
            filter: () => (m) => m.id !== clientID,
        },
        users: {
            interval: 5000,
            filter: () => (m) => m.id !== clientID,
        },
    },
    defaultPrefix: prefix,
    loadMessageCommandListeners: true,
    caseInsensitiveCommands: true,
    caseInsensitivePrefixes: true,
});

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

client.login();
