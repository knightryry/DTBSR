// i hate njs so much. why cant i just use this in the index :sob:
const twitch_oauth = process.env.twitch_oauth;
const twitch_nick = process.env.twitch_nick;
const twitch_channel = process.env.twitch_channel;
const WebSocket = require('ws');

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

function calculateBackoffDelay(attempt) {
	const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, attempt), MAX_RECONNECT_DELAY);
	return delay + Math.random() * 1000; // Add jitter
}

function connect() {
	try {
		socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

		socket.addEventListener('open', () => {
			console.log('Connected to Twitch IRC');
			reconnectAttempts = 0; // Reset attempts on successful connection
			socket.send(`PASS oauth:${twitch_oauth}`);
			socket.send(`NICK ${twitch_nick}`);
			socket.send(`JOIN #${twitch_channel}`);
		});

		socket.addEventListener('message', (event) => {
			const message = event.data;
			console.log(`Message received: ${message}`);
			if (message.startsWith('PING')) {
				socket.send(message.replace('PING', 'PONG'));
			}
		});

		socket.addEventListener('close', () => {
			console.log('Disconnected from Twitch IRC');
			attemptReconnect();
		});

		socket.addEventListener('error', (error) => {
			console.error('Twitch WebSocket error:', error);
			// Close will trigger reconnect, but we log the error here for debugging
		});
	}
	catch (err) {
		console.error('Failed to create WebSocket:', err);
		attemptReconnect();
	}
}

function attemptReconnect() {
	if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
		console.error(`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
		return;
	}

	const delay = calculateBackoffDelay(reconnectAttempts);
	reconnectAttempts++;
	console.log(`Attempting to reconnect to Twitch (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${Math.round(delay)}ms`);

	setTimeout(() => {
		connect();
	}, delay);
}

function sendToTwitch(text, user) {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		console.warn('Twitch socket not connected, queuing message for later');
		// Optionally: implement a message queue here if you want guaranteed delivery
		return;
	}

	try {
		socket.send(`PRIVMSG #${twitch_channel} :${text}`);
		socket.send(`PRIVMSG #${twitch_channel} :Requested by ${user}`);
	}
	catch (err) {
		console.error('Failed to send message request:', err);
	}
}

function initialize() {
	console.log('Initializing Twitch IRC connection...');
	connect();
}

module.exports = { sendToTwitch, initialize }; // make sure that njs doesnt have a mental breakdown when i try to use this in the request file