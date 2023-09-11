"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextFoilCheck = void 0;
const Button_1 = require("../Button");
const discord_js_1 = require("discord.js");
const Errors_1 = require("../Utils/Errors");
const Log_1 = require("../Utils/Log");
const PigRenderer_1 = require("../Utils/PigRenderer");
exports.NextFoilCheck = new Button_1.Button("NextFoilCheck", false, true, true, async (interaction, _serverInfo, messageInfo) => {
    if (messageInfo === undefined) {
        return;
    }
    await interaction.deferUpdate();
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const message = interaction.message;
    const msgInfo = messageInfo;
    if (msgInfo === undefined) {
        return;
    }
    let newPage = msgInfo.CurrentPage + 1;
    let setsNum = 0;
    setsNum += Object.keys(msgInfo.PigAmountsPerSet).length;
    const newFirstSet = newPage * 6 + 1;
    if (newFirstSet > setsNum) {
        newPage = 0;
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
