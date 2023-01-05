"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchPig = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const GetAuthor_1 = require("../Utils/GetAuthor");
const UserInfo_1 = require("../database/UserInfo");
exports.SearchPig = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("searchpig")
    .addStringOption(option => option.setName('id')
    .setDescription('Pig id')
    .setRequired(true))
    .setDescription("Searches for any users that have the specified pig.")
    .setDMPermission(false), async (interaction) => {
    const pigID = interaction.options.getString('id');
    if (pigID === null) {
        return;
    }
    const pig = (0, Pigs_1.GetPig)(pigID);
    if (pig === undefined) {
        const pigEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("No pig found with that id")
            .setDescription("Yikes, you sure the id is right\n(Number ids don't actually start with 0s)");
        await interaction.reply({
            ephemeral: true,
            embeds: [pigEmbed],
        });
        return;
    }
    const server = interaction.guild;
    const user = interaction.user;
    if (server === null) {
        return;
    }
    await interaction.deferReply();
    await (0, UserInfo_1.SaveAllUserInfo)();
    const q = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, `users`));
    const userInfoDocs = await (0, lite_1.getDocs)(q);
    const userIDsWithPig = [];
    const foundUsersWithPig = {};
    for (let i = 0; i < userInfoDocs.docs.length; i++) {
        const userInfoDoc = userInfoDocs.docs[i];
        if (userInfoDoc.id === user.id) {
            continue;
        }
        const amountOfPigs = userInfoDoc.data().Pigs[pigID];
        if (amountOfPigs === undefined || amountOfPigs <= 0) {
            continue;
        }
        try {
            if (server.members.cache.has(userInfoDoc.id)) {
                userIDsWithPig.push(userInfoDoc.id);
                foundUsersWithPig[userInfoDoc.id] = amountOfPigs;
                continue;
            }
            const userInServer = await server.members.fetch(userInfoDoc.id);
            if (userInServer !== undefined) {
                userIDsWithPig.push(userInfoDoc.id);
                foundUsersWithPig[userInfoDoc.id] = amountOfPigs;
            }
        }
        catch {
        }
    }
    if (userIDsWithPig.length === 0) {
        const noUsersFoundEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("No users have been found that have that pig")
            .setColor(discord_js_1.Colors.Red)
            .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
        interaction.followUp({
            embeds: [noUsersFoundEmbed]
        });
        return;
    }
    const descriptionLines = [];
    for (let i = 0; i < userIDsWithPig.length; i++) {
        const foundUserID = userIDsWithPig[i];
        if (!server.members.cache.has(foundUserID)) {
            continue;
        }
        const foundMember = await server.members.fetch(foundUserID);
        const pigNum = foundUsersWithPig[foundUserID];
        if (foundMember.nickname === null) {
            descriptionLines.push(`-${foundMember.user.username} -> ${pigNum} pig${pigNum > 1 ? "s" : ""}`);
        }
        else {
            descriptionLines.push(`-${foundMember.nickname} (${foundMember.user.username}) -> ${pigNum} pig${pigNum > 1 ? "s" : ""}`);
        }
    }
    const foundUsersEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Found users with pig #${pig.ID.padStart(3, "0")}:`)
        .setDescription(descriptionLines.join("\n"))
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [foundUsersEmbed]
    });
});
