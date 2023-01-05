"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPig = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const PigRenderer_1 = require("../Utils/PigRenderer");
exports.TestPig = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("testpig")
    .addStringOption(option => option.setName('id')
    .setDescription('Pig id')
    .setRequired(true))
    .setDescription("pig"), async (interaction) => {
    const rawId = interaction.options.getString('id');
    let id = "0";
    if (rawId !== null) {
        id = rawId.toString();
    }
    const pig = (0, Pigs_1.GetPig)(id);
    if (pig === undefined) {
        const pigEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("No pig found")
            .setDescription("Yikes, you sure the id is right");
        await interaction.followUp({
            ephemeral: true,
            embeds: [pigEmbed],
        });
        return;
    }
    const pigEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Here's your pig");
    const img = (0, PigRenderer_1.AddPigRenderToEmbed)(pigEmbed, { pig: pig });
    await interaction.reply({
        embeds: [pigEmbed],
        files: [img]
    });
});
