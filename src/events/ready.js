const chalk = require('chalk');

module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run() {

        const client = this.client;

        client.logger.log(`Loading a total of ${client.interactions.size} interaction(s).`, 'log');
        client.logger.log(`${client.user.tag}, ready to serve ${client.guilds.cache.size} servers.`, 'ready');

        try {
            await client.application?.commands.set(client.interactionsData);
        } catch (error) {
            client.logger.log(error, 'error');
        }


        const status = require('../../config').status;

        let i = 0;

        setInterval(async function () {

            const request = await client.modules.getFromEndpoint();

            let toDisplay = 'zevent.fr';

            if (request.status === 200) {
                toDisplay = status[parseInt(i, 10)].name.replace('{streamersCount}', request.data.live.filter(streamer => streamer.online).length || '0').replace('{viewersCount}', request.data.viewersCount.formatted) + ` | ` + request.data.donationAmount.formatted;
            }

            client.user.setActivity(toDisplay, {
                type: status[parseInt(i, 10)].type,
                url: 'https://www.twitch.tv/zevent'
            });
            if (status[parseInt(i + 1, 10)]) i++;
            else i = 0;
        }, 20000);

        setTimeout(() => {
            console.log(chalk.magenta('\n\nLike this bot?'), 'Support me by adding a star on GitHub ❤️   https://github.com/glazk0/Z-EventDiscordBot');
        }, 400);
    }
};