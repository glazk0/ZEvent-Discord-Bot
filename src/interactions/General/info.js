const Interaction = require('../../base/Interaction'),
    {
        version,
        MessageEmbed,
        MessageActionRow,
        MessageButton
    } = require('discord.js');

class Info extends Interaction {

    constructor(client) {
        super(client, {
            name: 'info',
            description: 'Gets ZEvent bot stats & informations',
            clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS']
        });
    }

    async run(interaction, data) {

        var users = 0;

        this.client.guilds.cache.forEach((guild) => {
            users += guild.memberCount;
        });

        const button = new MessageActionRow()
            .addComponents(new MessageButton()
                .setLabel(interaction.translate('button:INVITE_ME'))
                .setStyle('LINK')
                .setURL(this.client.config.inviteURL.replace('{{id}}', this.client.user.id)));

        const embed = new MessageEmbed()

            .setColor(data.config.embed.color)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setDescription('ZEvent Bot is a Open Source Discord bot developed by glazk0#7861 for the ZEvent event from Zerator.')
            .setThumbnail(this.client.user.displayAvatarURL({
                size: 512,
                dynamic: true,
                format: 'png'
            }))
            .addFields({
                name: 'Statistics',
                value: `Servers: ${this.client.guilds.cache.size.toLocaleString('en-US')}\nUsers: ${users.toLocaleString('en-US')}`,
                inline: false,
            }, {
                name: 'Using',
                value: `Discord.js : v**${version}**\nNodejs : v**${process.versions.node}**`,
                inline: false,
            }, {
                name: 'Uptime',
                value: `Online for ${interaction.convertTime(Date.now() + this.client.uptime, 'from', true)}`,
                inline: false,
            });

        return interaction.reply({
            embeds: [embed],
            components: [button]
        });
    }
};

module.exports = Info;