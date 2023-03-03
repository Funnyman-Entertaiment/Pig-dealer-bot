"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Change12PackCooldown = exports.Change5PackCooldown = exports.ChangePackCooldown = exports.ChangeOpeningCooldown = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Variables_1 = require("../Constants/Variables");
exports.ChangeOpeningCooldown = new Command_1.Command("", "", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("setopeningcooldown")
    .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
    .setName("cooldown")
    .setDescription("new cooldown in minutes")
    .setRequired(true))
    .setDescription("Changes the cooldown between each pack opening."), async (interaction) => {
    const options = interaction.options;
    const newCooldown = options.getInteger("cooldown", true);
    Variables_1.Cooldowns.MINUTES_PACK_OPENING_CD = newCooldown;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
});
exports.ChangePackCooldown = new Command_1.Command("", "", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("setpackcooldown")
    .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
    .setName("cooldown")
    .setDescription("new cooldown in minutes")
    .setRequired(true))
    .setDescription("Changes the cooldown between each pack drop (default is 10)."), async (interaction) => {
    const options = interaction.options;
    const newCooldown = options.getInteger("cooldown", true);
    Variables_1.Cooldowns.MINUTES_BETWEEN_PACKS = newCooldown;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
});
exports.Change5PackCooldown = new Command_1.Command("", "", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("set5packinterval")
    .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
    .setName("cooldown")
    .setDescription("new cooldown in minutes")
    .setRequired(true))
    .setDescription("Changes the interval for 5 pack drop (default is 180)."), async (interaction) => {
    const options = interaction.options;
    const newCooldown = options.getInteger("cooldown", true);
    Variables_1.Cooldowns.MINUTES_BETWEEN_5_PACKS = newCooldown;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
});
exports.Change12PackCooldown = new Command_1.Command("", "", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("set12packinterval")
    .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
    .setName("cooldown")
    .setDescription("new cooldown in minutes")
    .setRequired(true))
    .setDescription("Changes the interval for 12 pack drop (default is 540)."), async (interaction) => {
    const options = interaction.options;
    const newCooldown = options.getInteger("cooldown", true);
    Variables_1.Cooldowns.MINUTES_BETWEEN_12_PACKS = newCooldown;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
});
