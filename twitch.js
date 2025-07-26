// i hate njs so much. why cant i just use this in the index :sob:
const { twitch_oauth, twitch_nick, twitch_channel } = require('./config.json');

const WebSocket = require('ws');
const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

socket.addEventListener('open', () => {
    console.log('Connected to Twitch IRC');
    socket.send(`PASS oauth:${twitch_oauth}`);
    socket.send(`NICK ${twitch_nick}`);
    socket.send(`JOIN ${twitch_channel}`);
});

socket.addEventListener('message', (event) => {
    const message = event.data;
    console.log(`Message received: ${message}`);
    if (message.startsWith('PING')) {
        socket.send(message.replace('PING', 'PONG'));
    }
});

function sendToTwitch(text, user) {
    socket.send(`PRIVMSG ${twitch_channel} :${text}`);
    socket.send(`PRIVMSG ${twitch_channel} :${user} requested: ${text}`);
}

module.exports = { sendToTwitch }; // make sure that njs doesnt have a mental breakdown when i try to use this in the request file