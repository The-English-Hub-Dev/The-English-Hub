const { container } = require('@sapphire/pieces');
const { ActivityType, ChannelType } = require('discord.js');
const {
    mainGuildID,
    twoRoomsParentID,
    threeRoomsParentID,
} = require('../../config.json');
let statusNum = 1;

class Tasks {
    constructor() {
        this.intervals = {};
    }

    async initializeTasks() {
        await this.initializeStatusTask();
        await this.initializeHealthcheck();
    }

    async initializeStatusTask() {
        const statusInterval = setInterval(() => {
            if (statusNum == 3) {
                const guild =
                    container.client.guilds.cache.get('801609515391778826');
                if (guild) {
                    container.client.user.setActivity(
                        `${guild.memberCount.toLocaleString()} members`,
                        {
                            type: ActivityType.Watching,
                        }
                    );
                }
                statusNum = 1;
            } else if (statusNum == 2) {
                container.client.user.setActivity(
                    'Use ?help to see a list of my commands!',
                    { type: ActivityType.Playing }
                );
                statusNum++;
            } else {
                container.client.user.setActivity(
                    'DM me to ask a question to the staff!',
                    { type: ActivityType.Playing }
                );
                statusNum++;
            }
        }, 20000);

        this.intervals.status = statusInterval;
    }

    async initializeHealthcheck() {
        if (!process.env.HEALTHCHECK_URL) {
            container.logger.warn(
                'No healthcheck url was provided. Healthcheck task will not be initialized.'
            );
            return;
        }
        const healthCheckInterval = setInterval(async () => {
            await fetch(process.env.HEALTHCHECK_URL, {
                method: 'POST',
            });
        }, 120000);

        this.intervals.healthCheck = healthCheckInterval;
    }
}

module.exports = { Tasks };
