"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavouritePigCmd = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const UserInfo_1 = require("../database/UserInfo");
const GetAuthor_1 = require("../Utils/GetAuthor");
exports.FavouritePigCmd = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("favourite")
    .addStringOption(option => option.setName('id')
    .setDescription('ID of the pig you wanna favourite.')
    .setRequired(true))
    .setDescription("Favourites a pig. If the pig was already favourite, it unfavourites it"), async function (interaction) {
    const pigID = interaction.options.getString('id', true);
    const pig = (0, Pigs_1.GetPig)(pigID);
    if (pig === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("This pig doesn't exist!")
            .setColor("Red");
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const userInfo = await (0, UserInfo_1.GetUserInfo)(interaction.user.id);
    const userPigs = (0, UserInfo_1.GetUserPigIDs)(userInfo);
    if (userInfo === undefined || !userPigs.includes(pigID)) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You don't have this pig!")
            .setColor("Red");
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    if (userInfo.FavouritePigs.includes(pigID)) {
        const index = userInfo.FavouritePigs.indexOf(pigID);
        userInfo.FavouritePigs.slice(index, 1);
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`Pig #${pigID.padStart(3, '0')} succesfully unfavourited!`)
            .setColor(discord_js_1.Colors.Green)
            .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
        interaction.reply({
            embeds: [successEmbed],
            ephemeral: true
        });
    }
    else {
        userInfo.FavouritePigs.push(pigID);
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`Pig #${pigID.padStart(3, '0')} succesfully favourited!`)
            .setColor(discord_js_1.Colors.Green)
            .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
        interaction.reply({
            embeds: [successEmbed],
            ephemeral: true
        });
    }
});
