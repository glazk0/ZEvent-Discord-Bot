module.exports = (display, name, game) => {
    if (display && game) {
        return `[${display}](https://www.twitch.tv/${name}) - 🎮 **${game}**`
    } else {
        return `https://www.twitch.tv/${name}`
    }
}