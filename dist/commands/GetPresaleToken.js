"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPresaleToken = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
exports.GetPresaleToken = new Command_1.Command("GetPresaleToken", "Gives you your unique token for the presale of Funky Pigs.", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("getpresaletoken")
    .setDescription("Gives you your unique token for the presale of Funky Pigs."), async (interaction) => {
    const userId = interaction.user.id;
    const uniqueToken = parseInt(userId) * 2;
    const eventsEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Here is your unique token!")
        .setDescription(`${uniqueToken}`)
        .setColor(discord_js_1.Colors.DarkVividPink);
    interaction.reply({
        embeds: [eventsEmbed],
        ephemeral: true
    });
});
