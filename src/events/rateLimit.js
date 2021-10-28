module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(rateLimitInfo) {
        this.client.logger.log(`Client -> is being rate limited. Timeout: ${rateLimitInfo.timeout}ms | Limit: ${rateLimitInfo.limit} | Method: ${rateLimitInfo.method} Path: ${rateLimitInfo.path}`, 'debug')
    }
};