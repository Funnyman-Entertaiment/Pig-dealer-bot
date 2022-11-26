"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrevGallery = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const Button_1 = require("../Button");
const PigRenderer_1 = require("../Utils/PigRenderer");
exports.PrevGallery = new Button_1.Button("GalleryPrevious", async (_, interaction, db) => {
    await interaction.deferUpdate();
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const message = interaction.message;
    const msgDoc = (0, lite_1.doc)(db, `serverInfo/${server.id}/messages/${message.id}`);
    const msgInfo = await (0, lite_1.getDoc)(msgDoc);
    if (!msgInfo.exists() || msgInfo.data().Type !== "PigGallery") {
        return;
    }
    const msgInfoData = msgInfo.data();
    if (interaction.user.id !== msgInfoData.User) {
        return;
    }
    if (msgInfoData.CurrentPig === 0) {
        return;
    }
    const pigToLoad = msgInfoData.Pigs[msgInfoData.CurrentPig - 1];
    await (0, lite_1.updateDoc)(msgDoc, {
        CurrentPig: msgInfoData.CurrentPig - 1,
    });
    const editedEmbed = new discord_js_1.EmbedBuilder(message.embeds[0].data)
        .setDescription(`${msgInfoData.CurrentPig}/${msgInfoData.Pigs.length}`);
    const pigDoc = (0, lite_1.doc)(db, `pigs/${pigToLoad}`);
    const pig = await (0, lite_1.getDoc)(pigDoc);
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(editedEmbed, pig, msgInfoData.NewPigs.includes(pig.id));
    if (imgPath === undefined) {
        return;
    }
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(msgInfoData.CurrentPig - 1 === 0), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(false));
    await message.edit({
        embeds: [editedEmbed],
        files: [imgPath],
        components: [row]
    });
});
