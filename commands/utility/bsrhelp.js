// this command only exist for the stupid people who have never used bsr before.
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bsrhelp')
		.setDescription('Figure out how to use the request command'),
	async execute(interaction) {
		await interaction.reply('To request a song, go to https://beatsaver.com/search and find a song, Click on "Copy !bsr" and paste it into the request command. make sure its only the code it doesnt have !bsr in the beginning, it wont work if you do!');
	},
};