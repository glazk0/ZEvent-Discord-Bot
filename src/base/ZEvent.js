const {
    Client,
    Collection,
    Intents
} = require('discord.js'),
    util = require('util'),
    path = require('path');

class ZEvent extends Client {

    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGES
            ],
            allowedMentions: {
                parse: ['users', 'roles'],
                repliedUser: false
            }
        });

        this.config = require('../../config');

        this.interactions = new Collection();

        this.interactionsData = [];

        this.modules = require('../modules/index');
        this.logger = require('../modules/logger');

        this.wait = util.promisify(setTimeout);
    }

    loadInteraction(interactionPath, interactionName) {
        try {

            const props = new(require(`.${interactionPath}${path.sep}${interactionName}`))(this);

            this.logger.log(`Loading Interaction: ${props.help.name}.`, 'log');

            if (props.init) {
                props.init(this);
            }

            this.interactions.set(props.help.name, props);

            this.interactionsData.push({
                name: props.help.name,
                description: props.help.description,
                options: props.help.options
            });

            return false;
        } catch (e) {
            return `Unable to load interaction ${interactionName}: ${e}`;
        }
    }
}

module.exports = ZEvent;