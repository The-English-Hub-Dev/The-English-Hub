const { container } = require('@sapphire/framework');
const { DataSource } = require('typeorm');
const { PunishmentEntity } = require('./entities/PunishmentEntity');

class Database {
    constructor() {
        const ds = new DataSource({
            type: 'postgres',
            connectTimeoutMS: 5000,
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: true },
            logging: ['error'],
            synchronize: true,
            entities: [require('./entities/PunishmentEntity').punishmentEntity],
            cache: {
                type: 'ioredis',
                duration: 20000,
                options: {
                    host: process.env.REDIS_HOST,
                    port: process.env.REDIS_PORT,
                },
            },
        });
        ds.initialize().catch((e) => container.logger.error(e));

        this.typeorm = ds;
        this.punishments = this.typeorm.getRepository('PunishmentEntity');
    }

    async initializeDB() {
        await this.typeorm.initialize();
    }
}

module.exports = { Database };
