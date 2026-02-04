const { DataSource } = require('typeorm');

class Database {
    constructor() {
        const ds = new DataSource({
            type: 'postgres',
            connectTimeoutMS: 5000,
            url: process.env.DATABASE_URL,
            logging: ['error'],
            synchronize: true,
            entities: [require('./entities/PunishmentEntity').punishmentEntity],
        });
        this.typeorm = ds;
        this.isInitialized = false;

        // Initialize asynchronously but track state
        this.initPromise = ds
            .initialize()
            .then(() => {
                this.punishments =
                    this.typeorm.getRepository('PunishmentEntity');
                this.isInitialized = true;
            })
            .catch((e) => {
                console.error('Database initialization failed:', e);
                throw e;
            });
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
