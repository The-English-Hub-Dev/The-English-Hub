const { DataSource } = require('typeorm');
const { PunishmentEntity } = require('./entities/PunishmentEntity');

const ds = new DataSource({
    type: 'postgres',
    connectTimeoutMS: 5000,
    url: process.env.DATABASE_URL,
    logging: ['error'],
    entities: [],
    cache: {
        type: 'ioredis',
        duration: 20000,
        options: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    },
});

class Database {
    async initializeDB() {
        this.typeorm = ds;

        this.punishments = this.typeorm.getRepository(PunishmentEntity);

        await this.typeorm.initialize();
    }
}

module.exports = { Database };