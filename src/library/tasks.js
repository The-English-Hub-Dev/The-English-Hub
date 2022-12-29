const cron = require('../../node_modules/node-cron');

class Tasks {
    constructor() {
        this.initializeTasks();
        this.intervals = [];
    }

    initializeTasks() {
        this.initializeDailyMemberReset();
    }

    initializeDailyMemberReset() {
        cron.schedule('');
    }
}

module.exports = { Tasks };
