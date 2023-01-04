"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const GetAuthor_1 = require("../Utils/GetAuthor");
const Variables_1 = require("../Constants/Variables");
exports.Report = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("report")
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("content")
    .setDescription("content of the report")
    .setRequired(true))
    .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"), async (interaction) => {
    const options = interaction.options;
    const content = options.getString("content");
    const reportEmbed = new discord_js_1.EmbedBuilder()
        .setAuthor((0, GetAuthor_1.GetAuthor)(interaction))
        .setTitle(`New report from ${interaction.user.username}`)
        .setDescription(content)
        .setColor(discord_js_1.Colors.Orange);
    Variables_1.DevSpace.ReportChannel.send({
        embeds: [reportEmbed]
    });
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Report sent successfully!`)
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        ephemeral: true,
        embeds: [successEmbed]
    });
});
