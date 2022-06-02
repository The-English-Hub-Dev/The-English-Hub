const EntitySchema = require('typeorm').EntitySchema;
const { container } = require('@sapphire/framework');
const { DiscordSnowflake, Snowflake } = require('@sapphire/snowflake');
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
		duration: {
			type: 'text',
		}
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
    constructor(userID, moderatorID, reason, type, duration) {
        const currentDate = new Date();
        const p = {
            punishment_id: String(
                DiscordSnowflake.generate({ timestamp: currentDate.getTime() })
            ),
            moderator_id: moderatorID,
            user_id: userID,
            reason: reason,
            timestamp: currentDate,
            type: type,
			duration: duration ?? null
        };
        this.savePunishment(p);
    }

    async savePunishment(p) {
        await container.database.punishments.save(p);
    }
}

module.exports = { Punishment, punishmentEntity };
