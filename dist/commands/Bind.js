"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowBinder = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const PigRenderer_1 = require("../Utils/PigRenderer");
const Command_1 = require("../Command");
function GetAuthor(interaction) {
    if (interaction.user === null) {
        return null;
    }
    const user = interaction.user;
    const username = user.username;
    const avatar = user.avatarURL();
    return { name: username, iconURL: avatar === null ? "" : avatar };
}
exports.ShowBinder = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("binder")
    .addUserOption(option => option.setName('user')
    .setDescription('user to check the binder of'))
    .setDescription("Let's you check your own or someone else's pig binder"), async (_, interaction, db) => {
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const user = interaction.options.getUser('user');
    let userId;
    let author;
    if (user === null) {
        author = GetAuthor(interaction);
        if (author === null) {
            return;
        }
        userId = interaction.user.id;
    }
    else {
        userId = user.id;
        const username = user.username;
        const avatar = user.avatarURL();
        author = { name: username, iconURL: avatar === null ? "" : avatar };
    }
    const pigsQuery = (0, lite_1.query)((0, lite_1.collection)(db, `serverInfo/${server.id}/users/${interaction.user.id}/pigs`));
    const pigs = await (0, lite_1.getDocs)(pigsQuery);
    const pigsSet = [];
    pigs.forEach(pig => {
        if (!pigsSet.includes(pig.data().PigId)) {
            pigsSet.push(pig.data().PigId);
        }
    });
    pigsSet.sort((a, b) => {
        return parseInt(a) - parseInt(b);
    });
    const firstPigId = pigsSet[0];
    const firstPigDoc = (0, lite_1.doc)(db, `pigs/${firstPigId}`);
    const firstPig = await (0, lite_1.getDoc)(firstPigDoc);
    const openedPackEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${author.name}'s pig bind`)
        .setDescription(`1/${pigsSet.length}`)
        .setAuthor(author);
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, firstPig, false);
    if (imgPath === undefined) {
        return;
    }
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary));
    await interaction.followUp({
        embeds: [openedPackEmbed],
        components: [row],
        files: [imgPath]
    }).then(message => {
        const messageDoc = (0, lite_1.doc)(db, `serverInfo/${server.id}/messages/${message.id}`);
        (0, lite_1.setDoc)(messageDoc, {
            Type: "PigGallery",
            Pigs: pigsSet,
            NewPigs: [],
            CurrentPig: 0,
            User: interaction.user.id
        });
    });
});
