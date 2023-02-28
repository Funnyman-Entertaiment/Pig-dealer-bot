"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeFoilRequirements = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const PigsPerFoilRarity_1 = require("../Constants/PigsPerFoilRarity");
exports.ChangeFoilRequirements = new Command_1.Command("", "", new discord_js_1.SlashCommandBuilder()
    .setName("changefoilrequiredpigs")
    .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
    .setName("newamount")
    .setDescription("New amount of required pigs.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("rarity")
    .setDescription("Rarity lol")
    .setChoices({
    name: "Common",
    value: "Common"
}, {
    name: "Rare",
    value: "Rare"
}, {
    name: "Epic",
    value: "Epic"
}, {
    name: "Legendary",
    value: "Legendary"
})
    .setRequired(true))
    .setDescription("Changes the amount of required pigs for each foil.")
    .setDMPermission(false), async function (interaction) {
    const options = interaction.options;
    const rarity = options.getString("rarity", true);
    const amount = options.getInteger("newamount", true);
    PigsPerFoilRarity_1.PIGS_PER_FOIL_RARITY[rarity] = amount;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Required pigs for ${rarity} foils changed`)
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
});
