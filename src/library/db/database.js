const { container } = require('@sapphire/framework');
const { DataSource } = require('typeorm');

class Database {
    constructor() {
        const ds = new DataSource({
            type: 'postgres',
            connectTimeoutMS: 5000,
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            logging: ['error'],
            synchronize: true,
            entities: [require('./entities/PunishmentEntity').punishmentEntity],
            cache: {
                type: 'ioredis',
                duration: 20000,
                options: {
                    uri: process.env.REDIS_URL,
                },
            },
        });
        ds.initialize().catch((e) => console.log(e));

        this.typeorm = ds;
        this.punishments = this.typeorm.getRepository('PunishmentEntity');
    }

    async initializeDB() {
        await this.typeorm.initialize();
    }
}

module.exports = { Database };
