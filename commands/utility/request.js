// Okay this is where we start getting a bit more complex.
const { sendToTwitch } = require('../../twitch.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Make new command, make sure it will only send the !bsr code to the twitch chat, and only confirm the command to the executor in discord, not the whole discord chat though.
	data: new SlashCommandBuilder()
		.setName('request')
        // under 100 characters my ass, i hate you discord API
		.setDescription('Requests a song in my twitch chat, without going to twitch itself.')
        .addStringOption(option =>
            option.setName('bsr')
                .setDescription('The song you want to request (only !bsr codes are supported, no links or anything)')
                .setRequired(true)),
    // fuck async
	async execute(interaction) {
        const bsrCode = interaction.options.getString('bsr');
        // i LOVE IRC so much here, its so easy
        // This is stupid, why can't i just use the options to make the message ephemeral oh well, doesnt really matter.
		sendToTwitch('!bsr ' + bsrCode); // Send the request to Twitch chat
        await interaction.reply({ content: 'Sent !bsr ' + bsrCode + ' to requests', ephemeral: true });
	},
};
