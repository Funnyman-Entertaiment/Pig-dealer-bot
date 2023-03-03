"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreatWipe = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const Command_1 = require("../Command");
const SendMessage_1 = require("../Utils/SendMessage");
const UserInfo_1 = require("../database/UserInfo");
exports.GreatWipe = new Command_1.Command("", "", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("order66")
    .setDescription("Kill all the pigs"), async (interaction) => {
    await interaction.deferReply();
    const serverQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const serverDocs = await (0, lite_1.getDocs)(serverQuery);
    const serverIDs = [];
    const channelIDsPerServer = {};
    const userIDsPerServer = {};
    const maxPigCountForUser = {};
    serverDocs.forEach(serverDoc => {
        if (serverDoc.data().Channel !== undefined) {
            channelIDsPerServer[serverDoc.id] = serverDoc.data().Channel;
            serverIDs.push(serverDoc.id);
        }
    });
    for (let i = 0; i < serverIDs.length; i++) {
        const serverID = serverIDs[i];
        userIDsPerServer[serverID] = [];
        const userQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, `serverInfo/${serverID}/users`));
        const userDocs = await (0, lite_1.getDocs)(userQuery);
        userDocs.forEach(userDoc => userIDsPerServer[serverID].push(userDoc.id));
    }
    for (const serverID in userIDsPerServer) {
        const userIDs = userIDsPerServer[serverID];
        for (let i = 0; i < userIDs.length; i++) {
            const userID = userIDs[i];
            const pigsQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, `serverInfo/${serverID}/users/${userID}/pigs`));
            const pigDocs = await (0, lite_1.getDocs)(pigsQuery);
            const pigSet = [];
            pigDocs.forEach(pig => {
                const pigID = pig.data().PigId;
                if (pigSet.includes(pigID)) {
                    return;
                }
                pigSet.push(pigID);
            });
            const pigCount = pigSet.length;
            const previousPigCount = maxPigCountForUser[userID];
            if (previousPigCount === undefined || previousPigCount < pigCount) {
                maxPigCountForUser[userID] = pigCount;
            }
        }
    }
    const orderedTiers = [
        "**TIER 4 TESTERS**",
        "**TIER 3 TESTERS**",
        "**TIER 2 TESTERS**",
        "**TIER 1 TESTERS**",
    ];
    serverIDs.forEach(async (serverID) => {
        const usersPerRatPig = {};
        const usersInServer = userIDsPerServer[serverID];
        for (let i = 0; i < usersInServer.length; i++) {
            const userID = usersInServer[i];
            const user = await Bot_1.client.users.fetch(userID);
            const pigCount = maxPigCountForUser[userID];
            if (pigCount >= 200) {
                if (usersPerRatPig["**TIER 4 TESTERS**"] === undefined) {
                    usersPerRatPig["**TIER 4 TESTERS**"] = [];
                }
                usersPerRatPig["**TIER 4 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
            }
            else if (pigCount >= 100) {
                if (usersPerRatPig["**TIER 3 TESTERS**"] === undefined) {
                    usersPerRatPig["**TIER 3 TESTERS**"] = [];
                }
                usersPerRatPig["**TIER 3 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
            }
            else if (pigCount >= 50) {
                if (usersPerRatPig["**TIER 2 TESTERS**"] === undefined) {
                    usersPerRatPig["**TIER 2 TESTERS**"] = [];
                }
                usersPerRatPig["**TIER 2 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
            }
            else if (pigCount >= 0) {
                if (usersPerRatPig["**TIER 1 TESTERS**"] === undefined) {
                    usersPerRatPig["**TIER 1 TESTERS**"] = [];
                }
                usersPerRatPig["**TIER 1 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
            }
        }
        const fields = [];
        orderedTiers.forEach(tier => {
            if (usersPerRatPig[tier] !== undefined) {
                fields.push({
                    name: tier,
                    value: usersPerRatPig[tier].join("\n"),
                    inline: false
                });
            }
        });
        const pigTestersEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("THE GREAT PIG BUTCHERING")
            .setDescription("This is it, the great butchering. All of your pigs have been sent to a beautiful farm in Romania. In exchange each of you will get a special pig depending on the amount of pigs you had before the butchering.")
            .setFields(fields)
            .setColor(discord_js_1.Colors.DarkVividPink);
        (0, SendMessage_1.TrySendMessageToChannel)(serverID, channelIDsPerServer[serverID], {
            embeds: [pigTestersEmbed]
        });
    });
    for (const userID in maxPigCountForUser) {
        const pigCount = maxPigCountForUser[userID];
        const pigsToAdd = [];
        if (pigCount >= 200) {
            pigsToAdd.push("406");
        }
        if (pigCount >= 100) {
            pigsToAdd.push("405");
        }
        if (pigCount >= 50) {
            pigsToAdd.push("404");
        }
        if (pigCount >= 1) {
            pigsToAdd.push("403");
        }
        const userInfo = await (0, UserInfo_1.GetUserInfo)(userID) ?? (0, UserInfo_1.CreateNewDefaultUserInfo)(userID);
        (0, UserInfo_1.AddUserInfoToCache)(userInfo);
        pigsToAdd.forEach(pigToAdd => {
            userInfo.Pigs[pigToAdd] = 1;
        });
    }
    (0, UserInfo_1.SaveAllUserInfo)();
    const descriptionLines = [];
    for (const userID in maxPigCountForUser) {
        const pigCount = maxPigCountForUser[userID];
        const user = await Bot_1.client.users.fetch(userID);
        descriptionLines.push(`${user.username} collected ${pigCount} pigs`);
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle("Great Butchering Test")
        .setDescription(descriptionLines.join("\n"))
        .setColor(discord_js_1.Colors.DarkGreen);
    interaction.followUp({
        embeds: [embed]
    });
});
