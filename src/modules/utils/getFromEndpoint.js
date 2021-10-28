const axios = require('axios').default;

module.exports = async () => {
    let req = null;
    try {
        req = await axios({
            url: `https://zevent.fr/api/data.json`,
            method: 'get',
            headers: {
                'User-Agent': 'ZEvent'
            }
        });
    } catch (err) {
        req = err;
    } finally {
        return req;
    }
}