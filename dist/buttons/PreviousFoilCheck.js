"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviousFoilCheck = void 0;
const Button_1 = require("../Button");
const discord_js_1 = require("discord.js");
const Errors_1 = require("../Utils/Errors");
const Log_1 = require("../Utils/Log");
const PigRenderer_1 = require("../Utils/PigRenderer");
exports.PreviousFoilCheck = new Button_1.Button("PreviousFoilCheck", false, true, false, async (interaction, _serverInfo, messageInfo) => {
    if (messageInfo === undefined) {
        return;
    }
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
    const msgInfo = messageInfo;
    if (msgInfo === undefined) {
        return;
    }
    let newPage = msgInfo.CurrentPage - 1;
    let setsNum = 0;
    setsNum += Object.keys(msgInfo.PigAmountsPerSet).length;
    const maxSets = Math.floor(setsNum / 6) - 1;
    if (newPage < 0) {
        newPage = maxSets + 1;
    }
    msgInfo.CurrentPage = newPage;
    if (message.embeds[0] === undefined) {
        (0, Log_1.LogError)(`Couldn't get embed from message in channel ${(0, Log_1.PrintChannel)(interaction.channel)} in server ${(0, Log_1.PrintServer)(server)}`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't get embed from message", "Make sure the bot is able to send embeds");
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
