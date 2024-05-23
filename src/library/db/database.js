const { DataSource } = require('typeorm');

class Database {
    constructor() {
        const ds = new DataSource({
            type: 'postgres',
            connectTimeoutMS: 5000,
            url: process.env.DATABASE_URL,
            logging: ['error'],
            synchronize: true,
            entities: [
                require('./entities/PunishmentEntity').punishmentEntity,
                require('./entities/GiveawayEntity').giveawayEntity,
            ],
        });
        ds.initialize().catch((e) => console.error(e));

        this.typeorm = ds;
        this.punishments = this.typeorm.getRepository('PunishmentEntity');
    }

    async initializeDB() {
        await this.typeorm.initialize();
    }
}

module.exports = { Database };
