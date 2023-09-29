"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviousSet = void 0;
const discord_js_1 = require("discord.js");
const Button_1 = require("../Button");
const Errors_1 = require("../Utils/Errors");
const Log_1 = require("../Utils/Log");
const PigRenderer_1 = require("../Utils/PigRenderer");
const Pigs_1 = require("../database/Pigs");
exports.PreviousSet = new Button_1.Button("SetPrevious", false, true, false, async (interaction, _serverInfo, messageInfo) => {
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
    if (message.embeds[0] === undefined) {
        (0, Log_1.LogError)(`Couldn't get embed from message in channel ${(0, Log_1.PrintChannel)(interaction.channel)} in server ${(0, Log_1.PrintServer)(server)}`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't get embed from message", "Make sure the bot is able to send embeds");
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const sets = [];
    for (const set in msgInfo.PigsBySet) {
        sets.push(set);
    }
    sets.sort();
    const currentSetIndex = sets.indexOf(msgInfo.CurrentSet);
    let newSet;
    if (currentSetIndex - 1 < 0) {
        newSet = sets[sets.length - 1];
    }
    else {
        newSet = sets[currentSetIndex - 1];
    }
    msgInfo.CurrentPage = 0;
    msgInfo.CurrentSet = newSet;
    const editedEmbed = new discord_js_1.EmbedBuilder(message.embeds[0].data)
        .setDescription(`**${newSet === "-" ? "Default" : newSet}**`);
    const firstPigsPage = msgInfo.PigsBySet[newSet].slice(0, Math.min(msgInfo.PigsBySet[newSet].length, 9));
    (0, PigRenderer_1.AddPigListRenderToEmbed)(editedEmbed, {
        pigs: firstPigsPage.map(id => (0, Pigs_1.GetPig)(id)).filter(pig => pig !== undefined),
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
                    .setDisabled(msgInfo.PigsBySet[newSet].length <= 9)
            ]);
        }
        else if (component.customId === "ListPrevious") {
            newRow.addComponents([
                new discord_js_1.ButtonBuilder(component.data)
                    .setDisabled(true)
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
