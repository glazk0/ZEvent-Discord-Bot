const commandCooldown = {};

const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');

module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(interaction) {

        const data = {};

        if (!interaction.isCommand() && !interaction.isContextMenu() && !interaction.isSelectMenu()) return;
        if (!interaction.inGuild()) return;

        const client = this.client;
        data.config = client.config;

        if (interaction.isSelectMenu()) {

            if (interaction.customId === 'select_streamer') {

                await interaction.deferUpdate();

                let selectedStreamer = interaction.values[0];

                const embed = new MessageEmbed()
                    .setColor(data.config.embed.color)

                const request = await client.modules.getFromEndpoint();

                if (request.status === 200) {

                    const streamers = request.data;
                    const streamer = streamers.live.find(streamer => streamer.display.toLowerCase() == selectedStreamer.toLowerCase());

                    const button = new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setLabel('Make a donation')
                            .setStyle('LINK')
                            .setURL(streamer.donationUrl || streamers.globalDonationUrl));

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

                    await interaction.followUp({
                        embeds: [embed],
                        components: [button]
                    });
                }
            }
        }

        const command = client.interactions.get(interaction.commandName);

        if (command) {

            if (!command.configuration.enabled) {
                return interaction.reply({
                    content: 'This command is currently disabled!',
                    ephemeral: true
                });
            }

            if (interaction.inGuild()) {

                let neededPermissions = [];

                if (!command.configuration.clientPermissions.includes('EMBED_LINKS')) {
                    command.configuration.clientPermissions.push('EMBED_LINKS');
                }

                command.configuration.clientPermissions.forEach((perm) => {
                    if (!interaction.channel.permissionsFor(interaction.guild.me).has(perm)) {
                        neededPermissions.push(perm);
                    }
                });

                if (neededPermissions.length > 0) {
                    return interaction.reply({
                        content: `I need the following permissions to execute this command: ${neededPermissions.map((p) => `\`${p}\``).join(', ')}`,
                        ephemeral: true
                    });
                }

                neededPermissions = [];

                command.configuration.memberPermissions.forEach((perm) => {
                    if (!interaction.channel.permissionsFor(interaction.member).has(perm)) {
                        neededPermissions.push(perm);
                    }
                });

                if (neededPermissions.length > 0) {
                    return interaction.reply({
                        content: `You need the following permissions to execute this command: ${neededPermissions.map((p) => `\`${p}\``).join(', ')}`,
                        ephemeral: true
                    });
                }

                let userCooldown = commandCooldown[interaction.member.id];

                if (!userCooldown) {
                    commandCooldown[interaction.member.id] = {};
                    userCooldown = commandCooldown[interaction.member.id];
                }

                const time = userCooldown[command.help.name] || 0;

                if (time && (time > Date.now())) {
                    return interaction.reply({
                        content: `You must wait **${Math.ceil((time - Date.now()) / 1000)}** second(s) to be able to run this command again.`,
                        ephemeral: true
                    });
                }

                commandCooldown[interaction.member.id][command.help.name] = Date.now() + command.configuration.cooldown;
            }

            if (command.configuration.ownerOnly && !process.env.OWNERS.split(',').includes(interaction.author.id)) {
                return interaction.reply({
                    content: 'This command is only accessible for developers!',
                    ephemeral: true
                });
            }

            client.logger.log(`${interaction.member.user.username} (${interaction.member.id}) ran interaction ${command.help.name} in ${interaction.guild ? interaction.guild.name : 'DM'} (${interaction.guild ? interaction.guild.id : 'DM'})`, 'cmd');

            try {
                await command.run(interaction, data);
            } catch (error) {

                client.logger.log(error.stack, 'error');

                return interaction.reply({
                    content: `Something went wrong, please report it to **${data.config.developer.name}**!`,
                    ephemeral: true
                });
            }
        }
    }
};