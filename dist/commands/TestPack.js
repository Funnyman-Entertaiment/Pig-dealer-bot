"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPack = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const Command_1 = require("../Command");
exports.TestPack = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("testpack")
    .addIntegerOption(option => option.setName('id')
    .setDescription('Pack id')
    .setRequired(true))
    .setDescription("pack"), async (_, interaction, db) => {
    const rawId = interaction.options.getInteger('id');
    let id = "0";
    if (rawId !== null) {
        id = rawId.toString();
    }
    const docRef = (0, lite_1.doc)(db, "packs", id);
    const packSnap = await (0, lite_1.getDoc)(docRef);
    const packData = packSnap.data();
    if (packData === undefined) {
        return;
    }
    let img = `${id}.png`;
    const packEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(packData.Name)
        .setDescription(packData.Rarity)
        .setImage(`attachment://${img}`);
    await interaction.followUp({
        ephemeral: true,
        embeds: [packEmbed],
        files: [`./img/packs/${img}`]
    });
});
