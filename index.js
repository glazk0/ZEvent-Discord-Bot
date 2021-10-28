require('dotenv').config();

const util = require('util'),
    fs = require('fs'),
    readdir = util.promisify(fs.readdir);

const ZEvent = require('./src/base/ZEvent'),
    client = new ZEvent();

const init = async () => {

    const interactionsDirectories = await readdir('./src/interactions/');

    client.logger.log(`Loading a total of ${interactionsDirectories.length} interaction categories.`, 'log');

    interactionsDirectories.forEach(async (dir) => {

        const interactions = await readdir('./src/interactions/' + dir + '/');

        interactions.filter((interaction) => interaction.split('.').pop() === 'js').forEach((interaction) => {

            const response = client.loadInteraction('./interactions/' + dir, interaction);

            if (response) {
                client.logger.log(response, 'error');
            }
        });
    });

    const eventsFiles = await readdir('./src/events/');

    client.logger.log(`Loading a total of ${eventsFiles.length} events.`, 'log');

    eventsFiles.forEach((file) => {

        const eventName = file.split('.')[0];

        client.logger.log(`Loading Event: ${eventName}`);

        const event = new(require(`./src/events/${file}`))(client);

        client.on(eventName, (...args) => event.run(...args));

        delete require.cache[require.resolve(`./src/events/${file}`)];
    });

    client.login(process.env.TOKEN);
};

init();

client.on('disconnect', () => client.logger.log('Bot is disconnecting...', 'warn'))
    .on('reconnecting', () => client.logger.log('Bot reconnecting...', 'log'))
    .on('error', (error) => {
        client.logger.log(error, 'error');
    })
    .on('warn', (info) => {
        client.logger.log(info, 'warn');
    });

process.on('unhandledRejection', (error) => {
    console.error(error);
});