import { BaseEntity, Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('punishments')
export class PunishmentEntity extends BaseEntity {
	@PrimaryColumn('text')
	public punishmentID: string;

	@Column('timestamp')
	public timestamp: Date;

	constructor() {
		super();
	}
}
