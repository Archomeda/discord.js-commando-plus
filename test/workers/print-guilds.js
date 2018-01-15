/*
 Original author: Archomeda
 */

const commando = require('../../src/index');

class WorkerPrintGuilds extends commando.Worker {
    constructor(client) {
        super(client, {
            id: 'print-guilds',
            module: 'test',
            timer: 60000
        });
    }

    async run() {
        const guilds = this.getEnabledGuilds();
        console.log(guilds.map(g => g.id));
    }
}

module.exports = WorkerPrintGuilds;
