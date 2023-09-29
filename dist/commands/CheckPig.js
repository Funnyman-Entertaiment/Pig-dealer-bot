"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPig = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const PigRenderer_1 = require("../Utils/PigRenderer");
const UserInfo_1 = require("../database/UserInfo");
const GetAuthor_1 = require("../Utils/GetAuthor");
const Log_1 = require("../Utils/Log");
exports.CheckPig = new Command_1.Command("CheckPig", "Shows a single pig in your collection", false, true, new discord_js_1.SlashCommandBuilder()
    .setName("checkpig")
    .addStringOption(option => option.setName("id")
    .setDescription("ID of the pig you wanna check.")
    .setRequired(true))
    .setDescription("Shows you a single pig you own.")
    .setDMPermission(false), async function (interaction, _serverInfo, userInfo) {
    if (userInfo === undefined) {
        return;
    }
    const pigID = interaction.options.getString("id", true);
    const pig = (0, Pigs_1.GetPig)(pigID);
    if (pig === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("This pig doesn't exist!")
            .setColor("Red");
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const userPigs = (0, UserInfo_1.GetUserPigIDs)(userInfo);
    if (!userPigs.includes(pigID)) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You don't have this pig!")
            .setColor("Red");
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is checking it's pig #${pig.ID.padStart(3, "0")}`);
    const pigEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Here is your pig!")
        .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
    const img = (0, PigRenderer_1.AddPigRenderToEmbed)(pigEmbed, {
        pig: pig,
        favourite: userInfo?.FavouritePigs.includes(pigID),
        count: userInfo?.Pigs[pigID]
    });
    interaction.reply({
        embeds: [pigEmbed],
        files: [img]
    });
});
