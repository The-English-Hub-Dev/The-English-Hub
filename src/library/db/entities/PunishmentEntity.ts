import { DiscordSnowflake } from '@sapphire/snowflake';
import { BaseEntity, Entity, PrimaryColumn, Column } from 'typeorm';
import { PunishmentOptions } from '../../typings';

@Entity('punishments')
export class PunishmentEntity extends BaseEntity {
    @PrimaryColumn('text')
    public punishmentID: string;

    @Column('timestamp')
    public timestamp: Date;

    @Column('date')
    public moderator_id: string;

    @Column('text')
    public target_user_id: string;

    @Column('date')
    public expires: Date;

    constructor(options: PunishmentOptions) {
        super();
        const date = new Date();
        this.punishmentID = String(
            DiscordSnowflake.generate({ timestamp: date.getTime() })
        );
        this.timestamp = date;
        this.moderator_id = options.moderator_id;
        this.target_user_id = options.target_user_id;
        this.expires = options.duration.fromNow;
    }
}
