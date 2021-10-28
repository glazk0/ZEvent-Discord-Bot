const Interaction = require('../../base/Interaction'),
    {
        MessageActionRow,
        MessageButton
    } = require('discord.js');

class Invite extends Interaction {

    constructor(client) {
        super(client, {
            name: 'invite',
            description: 'Gets the ZEvent bot invite link',
            clientPermissions: ['SEND_MESSAGES']
        });
    }

    async run(interaction, _data) {

        const button = new MessageActionRow()
            .addComponents(new MessageButton()
                .setLabel('Add to my server')
                .setStyle('LINK')
                .setURL(this.client.config.inviteURL.replace('{id}', this.client.user.id)));

        return interaction.reply({
            content: 'Invite me to your server!',
            components: [button],
            ephemeral: true
        });
    }
};

module.exports = Invite;