"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextList = void 0;
const discord_js_1 = require("discord.js");
const Button_1 = require("../Button");
const Errors_1 = require("../Utils/Errors");
const Log_1 = require("../Utils/Log");
const PigRenderer_1 = require("../Utils/PigRenderer");
const Pigs_1 = require("../database/Pigs");
exports.NextList = new Button_1.Button("ListNext", true, true, false, async (interaction, serverInfo, messageInfo) => {
    if (serverInfo === undefined) {
        return;
    }
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
    if (message.embeds[0] === undefined) {
        (0, Log_1.LogError)(`Couldn't get embed from message in channel ${(0, Log_1.PrintChannel)(interaction.channel)} in server ${(0, Log_1.PrintServer)(server)}`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    msgInfo.CurrentPage++;
    const pigList = msgInfo.PigsBySet[msgInfo.CurrentSet];
    const pageStart = msgInfo.CurrentPage * 9;
    const pageEnd = Math.min(pigList.length, msgInfo.CurrentPage * 9 + 9);
    if (pageStart >= pigList.length) {
        msgInfo.CurrentPage--;
        return;
    }
    const editedEmbed = new discord_js_1.EmbedBuilder(message.embeds[0].data);
    const firstPigsPage = pigList.slice(pageStart, pageEnd);
    (0, PigRenderer_1.AddPigListRenderToEmbed)(editedEmbed, {
        pigs: firstPigsPage.map(id => (0, Pigs_1.GetPig)(id)).filter(pig => pig !== undefined),
        safe: serverInfo.SafeMode,
        pigCounts: msgInfo.PigCounts,
        sharedPigs: msgInfo.SharedPigs,
        favouritePigs: msgInfo.FavouritePigs
    });
    const originalRow = message.components[0];
    const newRow = new discord_js_1.ActionRowBuilder(message.components[0].data);
    originalRow.components.forEach(component => {
        if (component.customId === "ListNext") {
            newRow.addComponents([
                new discord_js_1.ButtonBuilder(component.data)
                    .setDisabled(pageEnd === pigList.length)
            ]);
        }
        else if (component.customId === "ListPrevious") {
            newRow.addComponents([
                new discord_js_1.ButtonBuilder(component.data)
                    .setDisabled(false)
            ]);
        }
        else {
            newRow.addComponents([
                new discord_js_1.ButtonBuilder(component.data)
            ]);
        }
    });
    await message.edit({
        embeds: [editedEmbed],
        components: [newRow]
    });
});
