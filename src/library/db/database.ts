import { DataSource, Repository } from 'typeorm';
import { PunishmentEntity } from './entities/PunishmentEntity';

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

export class Database {
    public typeorm: DataSource = null;
    public punishments: Repository<PunishmentEntity> = null;

    public async initializeDB() {
        this.typeorm = ds;

        this.punishments = this.typeorm.getRepository(PunishmentEntity);

        await this.typeorm.initialize();
    }
}
