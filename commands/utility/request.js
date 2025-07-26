// Okay this is where we start getting a bit more complex.
console.log('Loaded request.js');
const { sendToTwitch } = require('../../twitch.js');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    // Updated command: allows either a BSR code or a search term
    // This was absolute hell to make, but it was worth it.
    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Requests a song in my twitch chat, by BSR code or search for a map!')
        .addSubcommand(sub =>
            sub.setName('bsr')
                .setDescription('Request by BSR code (Only use if you know what youre doing.)')
                .addStringOption(option =>
                    option.setName('code')
                        .setDescription('The BSR code (e.g. abc12)')
                        .setRequired(true),
                ),
        )
        // literally every filter
        .addSubcommand(sub =>
            sub.setName('search')
                .setDescription('Search for a Beat Saber map by name (returns highest rated)')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Search for a Beat Saber map by name')
                        .setRequired(true),
                )
                .addBooleanOption(option =>
                    option.setName('chroma')
                        .setDescription('Require Chroma mod support? (Only use if you know what youre doing.)'),
                )
                .addBooleanOption(option =>
                    option.setName('vivify')
                        .setDescription('Require Vivify mod support? (Only use if you know what youre doing.)'),
                )
                .addBooleanOption(option =>
                    option.setName('noodle')
                        .setDescription('Require Noodle Extensions support? (Only use if you know what youre doing.)'),
                )
                .addBooleanOption(option =>
                    option.setName('mappingextensions')
                        .setDescription('Require Mapping Extensions support? (Only use if you know what youre doing.)'),
                ),
        ),
    // this is where i start losing my mind again
    // holy hell complexity 56??? :sob:
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'bsr') {
            const bsrCode = interaction.options.getString('code');
            const user = `@${interaction.user.username}`;
            if (bsrCode.startsWith('!bsr ')) {
                await interaction.reply({ content: 'Please remove "!bsr" from the beginning!', ephemeral: true });
                return;
            }
            // twitch time for people who know how the system works
            sendToTwitch('!bsr ' + bsrCode, user);
            await interaction.reply({ content: `Sent !bsr ${bsrCode} to requests`, ephemeral: true });
            return;
        }
        if (interaction.options.getSubcommand() === 'search') {
            const searchTerm = interaction.options.getString('query');
            const user = `@${interaction.user.username}`;
            const chroma = interaction.options.getBoolean('chroma');
            const vivify = interaction.options.getBoolean('vivify');
            const noodle = interaction.options.getBoolean('noodle');
            const mappingextensions = interaction.options.getBoolean('mappingextensions');
            let finalBsrCode = null;
            let mapTitle = null;
            let mapAuthor = null;
            let mapKey = null;
            let mapUrl = null;

            try {
                const response = await axios.get(
                    'https://api.beatsaver.com/search/text/0',
                    { params: { q: searchTerm }, timeout: 4000 },
                );
                let maps = response.data.docs;
                if (!maps || maps.length === 0) {
                    await interaction.reply({ content: `No maps found for "${searchTerm}".`, ephemeral: true });
                    return;
                }

                // Exclude automapper songs, because we hate Ai.
                maps = maps.filter(map => !(map.automapper === true || (map.metadata && map.metadata.automapper === true)));

                // filters: pt.2
                if (chroma) {
                    maps = maps.filter(map => map.versions && map.versions.some(v => v.diffs && v.diffs.some(d => d.requirements && d.requirements.includes('Chroma'))));
                }
                // vivify my beloved
                if (vivify) {
                    maps = maps.filter(map => map.versions && map.versions.some(v => v.diffs && v.diffs.some(d => d.requirements && d.requirements.includes('Vivify'))));
                }
                if (noodle) {
                    maps = maps.filter(map => map.versions && map.versions.some(v => v.diffs && v.diffs.some(d => d.requirements && d.requirements.includes('Noodle Extensions'))));
                }
                if (mappingextensions) {
                    maps = maps.filter(map => map.versions && map.versions.some(v => v.diffs && v.diffs.some(d => d.requirements && d.requirements.includes('Mapping Extensions'))));
                }
                if (!maps || maps.length === 0) {
                    await interaction.reply({ content: 'No maps found for your search and selected mod filters.', ephemeral: true });
                    return;
                }
                // do this by rating and grab the bsr code
                maps.sort((a, b) => (b.stats.score || 0) - (a.stats.score || 0));
                const topMap = maps[0];
                // shut up eslint please :pray:
                /* eslint-disable-next-line */
                finalBsrCode = topMap.id;
                mapTitle = topMap.name;
                mapAuthor = topMap.metadata && topMap.metadata.levelAuthorName ? topMap.metadata.levelAuthorName : 'Unknown';
                mapKey = topMap.id;
                mapUrl = `https://beatsaver.com/maps/${mapKey}`;

                // give the user the choice to see if its the right one, or if they majorly fucked up their search.
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId('confirm_bsr')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                    .setCustomId('cancel_bsr')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger),
                );
                // give the user their one warning
                await interaction.reply({
                    content: `**Top Result:**\nTitle: ${mapTitle}\nAuthor: ${mapAuthor}\nBSR: ${mapKey}\n[View on BeatSaver](${mapUrl})\n\nDo you want to send this request to Twitch?`,
                    components: [row],
                    ephemeral: true,
                });

                // wait for the user to actually do something for once.
                const filter = i => i.user.id === interaction.user.id;
                try {
                    const confirmation = await interaction.channel.awaitMessageComponent({
                    filter,
                    componentType: ComponentType.Button,
                    // THIRTY SECONDSSSSSSSSS
                    time: 30000,
                });
                if (confirmation.customId === 'confirm_bsr') {
                    sendToTwitch('!bsr ' + mapKey, user);
                    await confirmation.update({ content: `Sent !bsr ${mapKey} to requests ("${mapTitle}")`, components: [], ephemeral: true });
                }
                else {
                        await confirmation.update({ content: 'Request cancelled.', components: [], ephemeral: true });
                }
                }
                // if this runs then its a user skill issue
                catch {
                    await interaction.editReply({ content: 'No response, request cancelled.', components: [], ephemeral: true });
                }
            }
            // catch dem errors :p
            catch (err) {
                let msg = 'Error searching BeatSaver API.';
                if (err.response && err.response.status === 500) {
                    msg += ' Error 500. BeatSaver may currently experiencing issues. Try again later.';
                }
                await interaction.reply({ content: msg, ephemeral: true });
            }
        }
    },
};
