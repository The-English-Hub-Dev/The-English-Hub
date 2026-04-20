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

process.on('unhandledRejection', async (reason) => {
    const error =
        reason instanceof Error
            ? reason
            : new Error(`Unhandled rejection: ${String(reason)}`);

    if (!container || !container.utility || process.env.node_env == 'testing') {
        container.logger.error(error);
    } else {
        await container.utility.exception(error, 'UnhandledRejection');
    }
});

const redis = new Redis(process.env.REDIS_URL, {});
redis.on('connect', () => {
    container.logger.info('Connected to Redis Instance!');
});
redis.on('error', (err) => {
    container.logger.error('Redis connection error:', err);
});
container.redis = redis;
container.db = new Database();
container.utility = new Utility();
container.automodManager = new AutomodManager();
container.triggerManager = new TriggerManager();

// Ensure database is initialized before proceeding
container.db.initPromise.catch((err) => {
    container.logger.error('Failed to initialize database:', err);
    process.exit(1);
});

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
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

// Graceful shutdown handler
const shutdown = async (signal) => {
    container.logger.info(`Received ${signal}, shutting down gracefully...`);

    // Set timeout to force exit if shutdown takes too long
    const forceExitTimeout = setTimeout(() => {
        container.logger.warn('Shutdown taking too long, forcing exit...');
        process.exit(1);
    }, 10000); // 10 seconds timeout

    try {
        // Cleanup tasks intervals
        if (container.tasks) {
            container.tasks.cleanup();
        }

        // Cleanup voice state update listener timeouts
        const voiceListener = container.stores
            ?.get('listeners')
            ?.get('voiceStateUpdate');
        if (voiceListener && typeof voiceListener.onUnload === 'function') {
            voiceListener.onUnload();
        }

        // Close Redis connection
        if (container.redis) {
            await container.redis.quit().catch((err) => {
                container.logger.error('Error closing Redis:', err);
            });
            container.logger.info('Redis connection closed.');
        }

        // Close database connection
        if (container.db && container.db.typeorm) {
            await container.db.typeorm.destroy().catch((err) => {
                container.logger.error('Error closing database:', err);
            });
            container.logger.info('Database connection closed.');
        }

        // Cleanup utility timeouts
        if (container.utility) {
            container.utility.cleanup();
        }

        // Destroy client
        client.destroy();
        container.logger.info('Client destroyed.');

        clearTimeout(forceExitTimeout);
        process.exit(0);
    } catch (err) {
        container.logger.error('Error during shutdown:', err);
        clearTimeout(forceExitTimeout);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

const bootstrap = async () => {
    try {
        await container.db.ensureInitialized();
        await client.login();
    } catch (err) {
        container.logger.error('Startup failed:', err);
        process.exit(1);
    }
};

void bootstrap();
