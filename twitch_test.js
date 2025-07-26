const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const oauth = config.twitch_oauth;
const nick = config.twitch_nick;
const channel = config.twitch_channel;

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

    // Check if the message is a chat message
    if (message.startsWith('PING')) {
        socket.send(message.replace('PING', 'PONG'));
    }
    else if (message.includes('PRIVMSG')) {
        console.log(event.data); // This will log the chat messages, it wont actually matter though as im only sending stuff.
        if (event.data.includes('!ping')) {
            const response = `PRIVMSG ${channel} :Pong!`;
            socket.send(response);
        }
    }
});