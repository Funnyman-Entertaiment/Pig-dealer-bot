"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrevGallery = void 0;
const discord_js_1 = require("discord.js");
const MessageInfo_1 = require("../database/MessageInfo");
const Pigs_1 = require("../database/Pigs");
const Errors_1 = require("../Utils/Errors");
const Button_1 = require("../Button");
const PigRenderer_1 = require("../Utils/PigRenderer");
const UniquePigEvents_1 = require("../uniquePigEvents/UniquePigEvents");
exports.PrevGallery = new Button_1.Button("GalleryPrevious", async (_, interaction, db) => {
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
    const msgInfo = await (0, MessageInfo_1.GetMessageInfo)(server.id, message.id, db);
    if (msgInfo === undefined || msgInfo.Type !== "PigGallery") {
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
    if (msgInfo.CurrentPig === 0) {
        return;
    }
    const pigToLoad = msgInfo.Pigs[msgInfo.CurrentPig - 1];
    msgInfo.CurrentPig--;
    const editedEmbed = new discord_js_1.EmbedBuilder(message.embeds[0].data)
        .setDescription(`${msgInfo.CurrentPig + 1}/${msgInfo.Pigs.length}`);
    const pig = (0, Pigs_1.GetPig)(pigToLoad);
    if (pig === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't fetch pig", `Server: ${server.id}`, `Message: ${message.id}`, `Pig to Load: ${pigToLoad}`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(editedEmbed, pig, msgInfo.NewPigs.includes(pig.ID), !(0, UniquePigEvents_1.DoesPigIdHaveUniqueEvent)(pigToLoad));
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(msgInfo.CurrentPig === 0), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(false));
    await message.edit({
        embeds: [editedEmbed],
        files: [imgPath],
        components: [row]
    });
    if (!msgInfo.SeenPigs.includes(msgInfo.CurrentPig)) {
        msgInfo.SeenPigs.push(msgInfo.CurrentPig);
        (0, UniquePigEvents_1.TriggerUniquePigEvent)(pigToLoad, interaction);
    }
});
