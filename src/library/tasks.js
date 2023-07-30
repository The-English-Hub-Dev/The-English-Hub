const { container } = require('@sapphire/pieces');
const { ActivityType, ChannelType } = require('discord.js');
const {
    VoiceStateUpdateListener,
} = require('../listeners/guild/voiceStateUpdate');
const { mainGuildID, smallRoomParentID } = require('../../config.json');
let statusNum = 1;

class Tasks {
    constructor() {
        this.intervals = {};
    }

    async initializeTasks() {
        await this.initializeStatusTask();
        await this.initializeHealthcheck();
        await this.initializeDeleteInactiveTwoRooms();
    }

    async initializeStatusTask() {
        const statusInterval = setInterval(() => {
            if (statusNum == 2) {
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
                statusNum--;
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

    async initializeDeleteInactiveTwoRooms() {
        async function deleteAndRenameInactiveTwoRooms() {
            const twoRooms = container.client.guilds.cache
                .get(mainGuildID)
                .channels.cache.filter(
                    (channel) =>
                        channel.parent &&
                        channel.type == ChannelType.GuildVoice &&
                        channel.parent.id === smallRoomParentID
                )
                .map((channel) => channel);

            if (twoRooms.length == 1) return;

            for (let x = 0; x < twoRooms.length - 1; x++) {
                const room = twoRooms[x];
                if (room.members.size == 0 && room.manageable) {
                    await room.delete(
                        'This two room was inactive for one minute and was deleted.'
                    );
                }
            }

            const twoRoomsUpdated = container.client.guilds.cache
                .get(mainGuildID)
                .channels.cache.filter(
                    (channel) =>
                        channel.parent &&
                        channel.type == ChannelType.GuildVoice &&
                        channel.parent.id === smallRoomParentID
                )
                .map((channel) => channel);
            let startNaming = 1;

            for (let y = 0; y < twoRoomsUpdated.length; y++) {
                const room = twoRoomsUpdated[y];
                await room.setName(
                    `Room 2.${startNaming}`,
                    'Renaming the two rooms to be in order since one was deleted.'
                );
                startNaming++;
            }
        }

        const deleteInactiveTwo = setInterval(
            deleteAndRenameInactiveTwoRooms,
            7000
            // 60_000
        );

        this.intervals.deleteInactiveTwo = deleteInactiveTwo;
    }
}

module.exports = { Tasks };
