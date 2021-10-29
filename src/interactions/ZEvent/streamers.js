const Interaction = require('../../base/Interaction'),
    {
        MessageEmbed,
        MessageActionRow,
        MessageButton,
        MessageSelectMenu
    } = require('discord.js');

class Streamers extends Interaction {

    constructor(client) {
        super(client, {
            name: 'streamer',
            description: 'Gets the Z-Event online streamers list or information about a specific streamer',
            options: [{
                type: 1,
                name: 'get',
                description: 'Gets information about a specific streamer',
                options: [{
                    name: 'streamer',
                    description: 'Which streamer do you want to search?',
                    type: 3,
                    required: true
                }]
            }, {
                type: 1,
                name: 'list',
                description: 'Displays the all streamers list'
            }],
            clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(interaction, data) {

        const subCommand = await interaction.options.getSubcommand();

        const embed = new MessageEmbed()
            .setColor(data.config.embed.color)

        const request = await this.client.modules.getFromEndpoint();

        if (request.status === 200) {

            const streamers = request.data;

            switch (subCommand) {

                case 'get':

                    const streamerOption = await interaction.options.getString('streamer', true);

                    const streamer = streamers.live.find(streamer => streamer.display.toLowerCase() == streamerOption.toLowerCase());

                    if (!streamer) return interaction.reply(`I didn't find the streamer you are looking for, you should try another one.`);

                    const button = new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setLabel('Make a donation')
                            .setStyle('LINK')
                            .setURL(streamer.donationUrl));

                    embed
                        .setTitle(streamer.display)
                        .setURL(this.client.modules.createLink(null, streamer.twitch, null))
                        .setThumbnail(streamer.profileUrl)
                        .setDescription(`The ${streamer.display}'s donation goal is actually at: ${streamer.donationGoal.donationAmount.formatted}`)
                        .addFields({
                            name: 'Game',
                            value: streamer.game
                        }, {
                            name: 'Current viewers',
                            value: streamer.viewersAmount.formatted
                        });

                    interaction.reply({
                        embeds: [embed],
                        components: [button]
                    });
                    break;

                case 'list':

                    // Disclaimer ce code est caca mais flemme <3

                    let page = 1;
                    let viewersCount = 0;

                    const streamersArray = [];

                    streamers.live.forEach((streamer) => {
                        if (streamer.online) {
                            streamersArray.push({
                                label: streamer.display,
                                value: streamer.display,
                                emoji: '🎥'
                            });
                        }
                        viewersCount += streamer.viewersAmount.number;
                    });

                    const streamersList = new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                            .setCustomId('select_streamer')
                            .setPlaceholder('📌 Choose a streamer')
                            .addOptions(streamersArray.splice(0, 25))
                        );

                    let description =
                        `**${streamers.live.filter(streamer => streamer.online).length}** streamers\n**${viewersCount.toLocaleString('en-US')}** users are watching\n\n` +
                        streamers.live.filter(streamer => streamer.online).sort((a, b) => b.viewersAmount.number - a.viewersAmount.number).map((r) => r)
                        .map((r, i) => `**${i}** - ${this.client.modules.createLink(r.display, r.twitch, r.game)}`)
                        .slice(0, 25)
                        .join('\n');

                    embed.setTitle(`Page: ${page}/${Math.ceil(streamers.live.filter(streamer => streamer.online).length/25)}`)
                        .setDescription(description);

                    await interaction.reply({
                        content: `Showing a list of **${streamers.live.filter(streamer => streamer.online).length}** streamer(s)`
                    });

                    if (streamersArray > 25) {

                        await interaction.followUp({
                            embeds: [embed],
                            components: [streamersList]
                        });

                        const secondsStreamersList = new MessageActionRow()
                            .addComponents(
                                new MessageSelectMenu()
                                .setCustomId('select_streamer')
                                .setPlaceholder('📌 Choose a streamer')
                                .addOptions(streamersArray.splice(0, 25))
                            );

                        let description =
                            `**${streamers.live.filter(streamer => streamer.online).length}** streamers are streaming\n**${viewersCount.toLocaleString('en-US')}** users are watching\n\n` +
                            streamers.live.filter(streamer => streamer.online).sort((a, b) => b.viewersAmount.number - a.viewersAmount.number).map((r) => r)
                            .map((r, i) => `**${i + 1}** - ${this.client.modules.createLink(r.display, r.twitch, r.game)}`)
                            .slice(25, 50)
                            .join('\n');

                        embed.setTitle(`Page: ${page}/${Math.ceil(streamers.live.filter(streamer => streamer.online).length/25)}`)
                            .setDescription(description);

                        await interaction.followUp({
                            embeds: [embed],
                            components: [secondsStreamersList]
                        });

                    } else {
                        await interaction.followUp({
                            embeds: [embed],
                            components: [streamersList]
                        });
                    }
                    break;
            }
        } else if (request.response && request.response.status === 404) {
            return interaction.reply(`I didn't find the streamer you are looking for, you should try another one.`);
        }
    }
};

module.exports = Streamers;