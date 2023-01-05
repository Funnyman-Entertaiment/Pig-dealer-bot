"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPack = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Packs_1 = require("../database/Packs");
const ColorPerPackRarity_1 = require("../Constants/ColorPerPackRarity");
exports.TestPack = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("testpack")
    .addIntegerOption(option => option.setName('id')
    .setDescription('Pack id')
    .setRequired(true))
    .setDescription("pack"), async (interaction) => {
    const rawId = interaction.options.getInteger('id');
    let id = "0";
    if (rawId !== null) {
        id = rawId.toString();
    }
    const pack = (0, Packs_1.GetPack)(id);
    if (pack === undefined) {
        return;
    }
    let img = `${id}.png`;
    const packEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(pack.Name)
        .setDescription(pack.Rarity)
        .setImage(`attachment://${img}`)
        .setColor(ColorPerPackRarity_1.COLOR_PER_PACK_RARITY[pack.Rarity]);
    await interaction.reply({
        embeds: [packEmbed],
        files: [`./img/packs/${img}`]
    });
});
