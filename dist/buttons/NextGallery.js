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
const UniquePigEvents_1 = require("../uniquePigEvents/UniquePigEvents");
const Log_1 = require("../Utils/Log");
exports.NextGallery = new Button_1.Button("GalleryNext", async (interaction) => {
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
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("This message has expired")
            .setDescription("Messages expire after ~3 hours of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    if (msgInfo.Type !== "PigGallery") {
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
    if (message.embeds[0] === undefined) {
        (0, Log_1.LogError)(`Couldn't get embed from message in channel ${(0, Log_1.PrintChannel)(interaction.channel)} in server ${(0, Log_1.PrintServer)(server)}`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const editedEmbed = new builders_1.EmbedBuilder(message.embeds[0].data)
        .setDescription(`${msgInfo.CurrentPig + 1}/${msgInfo.Pigs.length}`);
    const pig = (0, Pigs_1.GetPig)(pigToLoad);
    if (pig === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't fetch pig", `Server: ${server.id}`, `Message: ${message.id}`, `Pig to Load: ${pigToLoad}`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(editedEmbed, {
        pig: pig,
        new: msgInfo.NewPigs.includes(pig.ID),
        showId: !(0, UniquePigEvents_1.DoesPigIdHaveUniqueEvent)(pigToLoad),
        count: msgInfo.PigCounts[pig.ID]
    });
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(msgInfo.Pigs.length === 1), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(msgInfo.CurrentPig == msgInfo.Pigs.length - 1));
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
