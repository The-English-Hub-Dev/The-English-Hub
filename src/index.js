const { SapphireClient, container } = require('@sapphire/framework');
const Sentry = require('@sentry/node');
const { Intents, Options } = require('discord.js');
const Redis = require('ioredis');
require('@sapphire/plugin-logger/register');
require('dotenv').config();
const { prefix, clientID } = require('../config.json');
const { Database } = require('./library/db/database');
const { Tasks } = require('./library/tasks');
const { Utility } = require('./library/utility');

process.on('uncaughtException', (error) => {
    if (!container || container.logger) console.log(error);
    else container.logger.error(error);
});

const redis = new Redis(process.env.REDIS_URL, {
    tls: {
        rejectUnauthorized: false,
    },
});

container.redis = redis;
container.db = new Database();
container.utility = new Utility();
container.tasks = new Tasks();

const client = new SapphireClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
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
