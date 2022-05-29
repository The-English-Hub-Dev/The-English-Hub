import { DiscordSnowflake } from "@sapphire/snowflake";
import { BaseEntity, Entity, PrimaryColumn, Column } from "typeorm";
import { PunishmentOptions } from "../../typings";

@Entity("punishments")
export class PunishmentEntity extends BaseEntity {
  @PrimaryColumn("text")
  public punishmentID: string;

  @Column("timestamp")
  public timestamp: Date;

  @Column("text")
  public moderator: string;

  constructor(options: PunishmentOptions) {
    super();
    const date = new Date();
    this.punishmentID = String(
      DiscordSnowflake.generate({ timestamp: date.getTime() })
    );
    this.timestamp = date;
    this.moderator = options.moderator.id;
  }
}
