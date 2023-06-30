const EntitySchema = require('typeorm').EntitySchema;
const { container } = require('@sapphire/framework');
const { DiscordSnowflake } = require('@sapphire/snowflake');
require('reflect-metadata');

const punishmentEntity = new EntitySchema({
    name: 'PunishmentEntity',
    tableName: 'punishments',
    columns: {
        punishment_id: {
            primary: true,
            type: 'text',
        },
        moderator_id: {
            type: 'text',
        },
        user_id: {
            type: 'text',
        },
        reason: {
            type: 'text',
        },
        timestamp: {
            type: 'timestamp',
        },
        type: {
            type: 'text',
        },
        expiration: {
            type: 'int',
        },
    },
});

class Punishment {
    /**
     *
     * @param { String } userID
     * @param { String } moderatorID
     * @param { String } reason
     * @param { String } duration
     * @param { String } type
     */
    constructor(modID, uID, reason, type, expiration) {
        const currentDate = new Date();
        const pSnowflake = String(
            DiscordSnowflake.generate({ timestamp: currentDate.getTime() })
        );

        const punishment = {
            punishment_id: pSnowflake,
            moderator_id: modID,
            user_id: uID,
            reason: reason,
            timestamp: currentDate,
            type: type,
            expiration: expiration,
        };

        this.punishment_id = pSnowflake;
        this.moderator_id = modID;
        this.user_id = uID;
        this.reason = reason;
        this.timestamp = currentDate;
        this.type = type;
        this.expiration = expiration;

        this.savePunishment(punishment);
    }

    async savePunishment(punishment) {
        return container.db.punishments.save(punishment);
    }
}

module.exports = { Punishment, punishmentEntity };
