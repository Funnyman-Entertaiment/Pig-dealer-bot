"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadPigsPacks = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Packs_1 = require("../database/Packs");
const Pigs_1 = require("../database/Pigs");
const ReadInitialDatabase_1 = require("../database/ReadInitialDatabase");
exports.ReloadPigsPacks = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("reloadpigspacks")
    .setDescription("Reloads the pigs and the packs from the database"), async (interaction) => {
    await interaction.deferReply();
    (0, Pigs_1.ClearPigs)();
    (0, Packs_1.ClearPacks)();
    (0, ReadInitialDatabase_1.ReadPigsAndPacks)();
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Pigs and packs reloaded succesfully")
        .setColor(discord_js_1.Colors.Green);
    await interaction.followUp({
        embeds: [successEmbed]
    });
});
