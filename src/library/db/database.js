const { DataSource } = require('typeorm');

class Database {
    constructor() {
        const ds = new DataSource({
            type: 'postgres',
            connectTimeoutMS: 5000,
            url: process.env.DATABASE_URL,
            logging: ['error'],
            // Avoid TypeORM schema sync concurrency during startup in production.
            synchronize: false,
            entities: [require('./entities/PunishmentEntity').punishmentEntity],
        });
        this.typeorm = ds;
        this.isInitialized = false;

        // Initialize asynchronously but track state
        this.initPromise = ds
            .initialize()
            .then(async () => {
                await this.bootstrapSchema();
                this.punishments =
                    this.typeorm.getRepository('PunishmentEntity');
                this.isInitialized = true;
            })
            .catch((e) => {
                console.error('Database initialization failed:', e);
                throw e;
            });
    }

    async bootstrapSchema() {
        await this.typeorm.query(`
            CREATE TABLE IF NOT EXISTS punishments (
                punishment_id TEXT PRIMARY KEY,
                moderator_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                type TEXT NOT NULL,
                expiration INT NULL
            )
        `);

        await this.typeorm.query(
            'CREATE INDEX IF NOT EXISTS idx_punishments_user_id ON punishments (user_id)'
        );
        await this.typeorm.query(
            'CREATE INDEX IF NOT EXISTS idx_punishments_moderator_id ON punishments (moderator_id)'
        );
        await this.typeorm.query(
            'CREATE INDEX IF NOT EXISTS idx_punishments_expiration ON punishments (expiration)'
        );
    }

    async initializeDB() {
        if (!this.isInitialized) {
            await this.initPromise;
        }
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initPromise;
        }
    }
}

module.exports = { Database };
