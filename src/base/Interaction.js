module.exports = class Interaction {
    constructor(client, {
        name = null,
        type = 1,
        description = 'No description provided',
        options = new Array(),
        clientPermissions = new Array(),
        memberPermissions = new Array(),
        enabled = true,
        guildOnly = true,
        ownerOnly = false,
        cooldown = 3000
    }) {
        this.client = client;
        this.help = {
            name,
            type,
            description,
            options
        };
        this.configuration = {
            enabled,
            guildOnly,
            clientPermissions,
            memberPermissions,
            ownerOnly,
            cooldown
        };
    }
};