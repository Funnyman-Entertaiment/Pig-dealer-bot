"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavouritePig = void 0;
const discord_js_1 = require("discord.js");
const Button_1 = require("../Button");
const Errors_1 = require("../Utils/Errors");
const MessageInfo_1 = require("../database/MessageInfo");
const UserInfo_1 = require("../database/UserInfo");
const Log_1 = require("../Utils/Log");
const PigRenderer_1 = require("../Utils/PigRenderer");
const Pigs_1 = require("../database/Pigs");
const UniquePigEvents_1 = require("../uniquePigEvents/UniquePigEvents");
exports.FavouritePig = new Button_1.Button("FavouritePig", async function (interaction) {
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
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
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
    const userInfo = await (0, UserInfo_1.GetUserInfo)(interaction.user.id);
    if (userInfo === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("This user has no information stored", `User: ${userInfo}`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const currentPigID = msgInfo.Pigs[msgInfo.CurrentPig];
    if (!msgInfo.FavouritePigs.includes(currentPigID)) {
        msgInfo.FavouritePigs.push(currentPigID);
    }
    if (!userInfo.FavouritePigs.includes(currentPigID)) {
        userInfo.FavouritePigs.push(currentPigID);
    }
    if (message.embeds[0] === undefined) {
        (0, Log_1.LogError)(`Couldn't get embed from message in channel ${(0, Log_1.PrintChannel)(interaction.channel)} in server ${(0, Log_1.PrintServer)(server)}`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const editedEmbed = new discord_js_1.EmbedBuilder(message.embeds[0].data);
    const pig = (0, Pigs_1.GetPig)(currentPigID);
    if (pig === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't fetch pig", `Server: ${server.id}`, `Message: ${message.id}`, `Pig to Load: ${currentPigID}`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(editedEmbed, {
        pig: pig,
        new: msgInfo.NewPigs.includes(pig.ID),
        showId: !(0, UniquePigEvents_1.DoesPigIdHaveUniqueEvent)(currentPigID),
        count: msgInfo.PigCounts[pig.ID],
        favourite: msgInfo.FavouritePigs.includes(pig.ID),
        shared: msgInfo.SharedPigs.includes(pig.ID)
    });
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(msgInfo.CurrentPig === 0), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(msgInfo.CurrentPig === msgInfo.Pigs.length - 1));
    if (msgInfo.ShowFavouriteButton) {
        if (!msgInfo.FavouritePigs.includes(pig.ID)) {
            row.addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('FavouritePig')
                .setLabel('Favourite ⭐')
                .setStyle(discord_js_1.ButtonStyle.Secondary));
        }
        else {
            row.addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('UnfavouritePig')
                .setLabel('Unfavourite ⭐')
                .setStyle(discord_js_1.ButtonStyle.Secondary));
        }
    }
    await message.edit({
        embeds: [editedEmbed],
        files: [imgPath],
        components: [row]
    });
});
