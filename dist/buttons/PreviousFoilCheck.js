"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviousFoilCheck = void 0;
const MessageInfo_1 = require("../database/MessageInfo");
const Button_1 = require("../Button");
const discord_js_1 = require("discord.js");
const Errors_1 = require("../Utils/Errors");
const Log_1 = require("../Utils/Log");
const PigRenderer_1 = require("../Utils/PigRenderer");
exports.PreviousFoilCheck = new Button_1.Button("PreviousFoilCheck", async (interaction) => {
    await interaction.deferUpdate();
    const server = interaction.guild;
    if (server === null) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Error fetching server from interaction", "Where did you find this message?");
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const message = interaction.message;
    const msgInfo = (0, MessageInfo_1.GetMessageInfo)(server.id, message.id);
    if (msgInfo === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("This message has expired")
            .setDescription("Messages expire after ~3 hours of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
            .setColor(discord_js_1.Colors.Red);
        await interaction.followUp({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    if (msgInfo.Type !== "FoilChecks") {
        return;
    }
    if (msgInfo.User === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("This message doesn't have an associated user", `Server: ${server.id}`, `Message: ${message.id}`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    if (interaction.user.id !== msgInfo.User) {
        return;
    }
    let newPage = msgInfo.CurrentPage - 1;
    let setsNum = 0;
    for (const _ in msgInfo.PigAmountsPerSet) {
        setsNum++;
    }
    const maxSets = Math.floor(setsNum / 6) - 1;
    if (newPage < 0) {
        newPage = maxSets;
    }
    msgInfo.CurrentPage = newPage;
    if (message.embeds[0] === undefined) {
        (0, Log_1.LogError)(`Couldn't get embed from message in channel ${(0, Log_1.PrintChannel)(interaction.channel)} in server ${(0, Log_1.PrintServer)(server)}`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const editedEmbed = new discord_js_1.EmbedBuilder(message.embeds[0].data)
        .setFields([]);
    (0, PigRenderer_1.AddFoilChecksToEmbed)(editedEmbed, {
        page: msgInfo.CurrentPage,
        pigAmountsPerSet: msgInfo.PigAmountsPerSet
    });
    message.edit({
        embeds: [editedEmbed]
    });
});
