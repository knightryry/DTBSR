// I had to completely redo this but whatever.
// (and as in redo i mean look at the discord.js guide and copy it :sob:)
// (thank you guys to whoever made it, i appreciate it a lot :3)

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
// why the hell do i have to import this here, i dont even use it in this file, but everything breaks if i dont, so here it will stay.
// also PLEASE shut up eslint, i know this is a stupid import, but i need it to make the twitch requests work.
// eslint-disable-next-line no-unused-vars
const { sendToTwitch } = require('./twitch.js'); // This used to be in index.js but i moved it to a separate file because node js is extremely fucking stupid.

const client = new Client({ intents: [GatewayIntentBits.Guilds] });


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
    catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
        else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(token); // WE ARE ON THE INTERNET WOOOOOOOOOOOOOOOO

