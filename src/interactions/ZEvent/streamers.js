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

                    let i0 = 0;
                    let i1 = 10;
                    let page = 1;

                    let streamersCount = 0;
                    let viewersCount = 0;

                    const streamersArray = [];

                    streamers.live.forEach((streamer) => {
                        if (streamer.online) {
                            streamersArray.push({
                                label: streamer.display,
                                value: streamer.twitch,
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
                            .addOptions(streamersArray)
                        );

                    let description =
                        `**${streamers.live.filter(streamer => streamer.online).length}** streamers are streaming\n**${viewersCount.toLocaleString('en-US')}** users are watching\n\n` +
                        streamers.live.filter(streamer => streamer.online).sort((a, b) => b.viewersAmount.number - a.viewersAmount.number).map((r) => r)
                        .map((r, i) => `**${i + 1}** - ${this.client.modules.createLink(r.display, r.twitch, r.game)}`)
                        .slice(0, 10)
                        .join('\n');

                    embed.setTitle(`Page: ${page}/${Math.ceil(streamers.live.filter(streamer => streamer.online).length/10)}`)
                        .setDescription(description);

                    await interaction.reply({
                        content: `Showing a list of **${streamers.live.filter(streamer => streamer.online).length}** streamer(s)`,
                        ephemeral: true
                    });

                    const streamersEmbed = await interaction.channel.send({
                        embeds: [embed],
                        components: [streamersList]
                    });

                    const collector = streamersEmbed.createMessageComponentCollector((component, user) => user.id === interaction.member.id);

                    collector.on('collect', async (component) => {

                        if (component.customId === 'left') {

                            await component.deferUpdate();

                            i0 = i0 - 10;
                            i1 = i1 - 10;
                            page = page - 1;

                            if (i0 < 0) {
                                return streamersEmbed.delete();
                            }
                            if (!i0 || !i1) {
                                return streamersEmbed.delete();
                            }

                            let description =
                                `**${streamersCount.length}** streamers are streaming\n**${viewersCount.toLocaleString('en-US')}** users are watching\n\n` +
                                streamers.live.filter(streamer => streamer.online).sort((a, b) => b.viewersAmount.number - a.viewersAmount.number).map((r) => r)
                                .map((r, i) => `**${i + 1}** - ${this.client.modules.createLink(r.display, r.twitch, r.game)}`)
                                .slice(i0, i1)
                                .join('\n');

                            embed.setTitle(`Page: ${page}/${Math.ceil(streamers.live.filter(streamer => streamer.online).length/10)}`)
                                .setDescription(description);

                            streamersEmbed.edit({
                                embeds: [embed],
                                components: [streamersList]
                            });
                        }

                        if (component.customId === 'right') {

                            await component.deferUpdate();

                            i0 = i0 + 10;
                            i1 = i1 + 10;
                            page = page + 1;

                            if (i1 > streamer.length + 10) {
                                return streamersEmbed.delete();
                            }

                            if (!i0 || !i1) {
                                return streamersEmbed.delete();
                            }

                            let description =
                                `**${streamersCount.length}** streamers are streaming\n**${viewersCount.toLocaleString('en-US')}** users are watching\n\n` +
                                streamers.live.filter(streamer => streamer.online).sort((a, b) => b.viewersAmount.number - a.viewersAmount.number).map((r) => r)
                                .map((r, i) => `**${i + 1}** - ${this.client.modules.createLink(r.display, r.twitch, r.game)}`)
                                .slice(i0, i1)
                                .join('\n');

                            embed.setTitle(`Page: ${page}/${Math.ceil(streamers.live.filter(streamer => streamer.online).length/10)}`)
                                .setDescription(description);

                            streamersEmbed.edit({
                                embeds: [embed],
                                components: [streamersList]
                            });
                        }

                        if (component.customId === 'cancel') {
                            return streamersEmbed.delete();
                        }
                    });
                    break;
            }
        } else if (request.response && request.response.status === 404) {
            return interaction.reply(`I didn't find the streamer you are looking for, you should try another one.`);
        }
    }
};

module.exports = Streamers;