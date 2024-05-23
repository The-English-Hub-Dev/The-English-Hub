const EntitySchema = require('typeorm').EntitySchema;
const { container } = require('@sapphire/framework');
require('reflect-metadata');

const giveawayEntity = new EntitySchema({
    name: 'Giveawayentity',
    tableName: 'giveaways',
    columns: {
        giveaway_id: {
            primary: true,
            type: 'text',
        },
        users_entered: {
            type: ('text', { array: true }),
        },
        end_timestamp: {
            type: 'timestamp',
        },
    },
});

class Giveaway {
    /**
     *
     * @param { String } giveaway_id
     * @param { String[] } users_entered
     * @param { String } end_timestamp
     */
    constructor(giveaway_id, users_entered, end_timestamp) {
        const giveaway = {
            giveaway_id: giveaway_id,
            users_entered: users_entered,
            end_timestamp: end_timestamp,
        };

        this.giveaway_id = giveaway_id;
        this.users_entered = users_entered;
        this.end_timestamp = end_timestamp;

        this.saveGiveaway(giveaway);
    }

    async saveGiveaway(giveaway) {
        return container.db.giveaways.save(giveaway);
    }
}

module.exports = { Giveaway, giveawayEntity };
