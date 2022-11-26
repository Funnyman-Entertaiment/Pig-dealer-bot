"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPig = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const Command_1 = require("../Command");
const fs_1 = tslib_1.__importDefault(require("fs"));
exports.TestPig = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("testpig")
    .addIntegerOption(option => option.setName('id')
    .setDescription('Pig id')
    .setRequired(true))
    .setDescription("pig"), async (_, interaction, db) => {
    const rawId = interaction.options.getInteger('id');
    let id = "0";
    if (rawId !== null) {
        id = rawId.toString();
    }
    const docRef = (0, lite_1.doc)(db, "pigs", id);
    const pigSnap = await (0, lite_1.getDoc)(docRef);
    const pigData = pigSnap.data();
    if (pigData === undefined) {
        return;
    }
    let img = `${id}.png`;
    if (pigData.Tags.includes("gif")) {
        img = `${id}.gif`;
    }
    if (!fs_1.default.existsSync(`./img/pigs/${img}`)) {
        img = `none.png`;
    }
    const pigEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(pigData.Name)
        .setDescription(pigData.Description.length > 0 ? pigData.Description : "...")
        .setImage(`attachment://${img}`)
        .setColor(discord_js_1.Colors.LuminousVividPink);
    await interaction.followUp({
        ephemeral: true,
        embeds: [pigEmbed],
        files: [`./img/pigs/${img}`]
    });
});
