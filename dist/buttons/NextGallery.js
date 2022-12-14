"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextGallery = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const MessageInfo_1 = require("../database/MessageInfo");
const Pigs_1 = require("../database/Pigs");
const Errors_1 = require("../Utils/Errors");
const Button_1 = require("../Button");
const PigRenderer_1 = require("../Utils/PigRenderer");
exports.NextGallery = new Button_1.Button("GalleryNext", async (_, interaction, db) => {
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
    if (msgInfo.CurrentPig == msgInfo.Pigs.length - 1) {
        return;
    }
    const pigToLoad = msgInfo.Pigs[msgInfo.CurrentPig + 1];
    msgInfo.CurrentPig++;
    const editedEmbed = new builders_1.EmbedBuilder(message.embeds[0].data)
        .setDescription(`${msgInfo.CurrentPig + 1}/${msgInfo.Pigs.length}`);
    const pig = await (0, Pigs_1.GetPig)(pigToLoad, db);
    if (pig === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't fetch pig", `Server: ${server.id}`, `Message: ${message.id}`, `Pig to Load: ${pigToLoad}`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(editedEmbed, pig, msgInfo.NewPigs.includes(pig.ID));
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(false), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(msgInfo.CurrentPig == msgInfo.Pigs.length - 1));
    await message.edit({
        embeds: [editedEmbed],
        files: [imgPath],
        components: [row]
    });
});
