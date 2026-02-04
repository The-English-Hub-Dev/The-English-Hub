const { SapphireClient, container } = require('@sapphire/framework');
const Sentry = require('@sentry/node');
const { GatewayIntentBits, Options, Partials } = require('discord.js');
const Redis = require('ioredis');
require('@sapphire/plugin-logger/register');
const { prefix, clientID } = require('../config.json');
const { Database } = require('./library/db/database');
const { Utility } = require('./library/utility');
const { AutomodManager } = require('./library/managers/automodManager');
const { TriggerManager } = require('./library/managers/triggerManager');

process.on('uncaughtException', async (error) => {
    if (!container || !container.utility || process.env.node_env == 'testing')
        container.logger.error(error);
    else {
        await container.utility.exception(error, 'Uncaught');
    }
});

const redis = new Redis(process.env.REDIS_URL, {});
redis.on('connect', () => {
    container.logger.info('Connected to Redis Instance!');
});
container.redis = redis;
container.db = new Database();
container.utility = new Utility();
container.automodManager = new AutomodManager();
container.triggerManager = new TriggerManager();

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
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
    loadApplicationCommandRegistriesStatusListeners: false,
    loadDefaultErrorListeners: false,
    allowedMentions: { roles: [] },
});

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

// Graceful shutdown handler
const shutdown = async (signal) => {
    container.logger.info(`Received ${signal}, shutting down gracefully...`);
    
    // Cleanup tasks intervals
    if (container.tasks) {
        container.tasks.cleanup();
    }
    
    // Cleanup voice state update listener timeouts
    const voiceListener = container.stores?.get('listeners')?.get('voiceStateUpdate');
    if (voiceListener && typeof voiceListener.onUnload === 'function') {
        voiceListener.onUnload();
    }
    
    // Close Redis connection
    if (container.redis) {
        await container.redis.quit();
        container.logger.info('Redis connection closed.');
    }
    
    // Close database connection
    if (container.db && container.db.dataSource) {
        await container.db.dataSource.destroy();
        container.logger.info('Database connection closed.');
    }
    
    // Destroy client
    client.destroy();
    container.logger.info('Client destroyed.');
    
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

client.login();
