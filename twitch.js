// i hate njs so much. why cant i just use this in the index :sob:
const oauth = '09vh7yowevdwwd6w4luy2fugf1fx0f';
const nick = 'knightryry';
const channel = '#knightryry';

const WebSocket = require('ws');
const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

socket.addEventListener('open', () => {
    console.log('Connected to Twitch IRC');
    socket.send(`PASS oauth:${oauth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN ${channel}`);
});

socket.addEventListener('message', (event) => {
    const message = event.data;
    console.log(`Message received: ${message}`);
    if (message.startsWith('PING')) {
        socket.send(message.replace('PING', 'PONG'));
    }
});

function sendToTwitch(text, user) {
    socket.send(`PRIVMSG ${channel} :${text}`);
    socket.send(`PRIVMSG ${channel} :${user} requested: ${text}`);
}

module.exports = { sendToTwitch }; // make sure that njs doesnt have a mental breakdown when i try to use this in the request file