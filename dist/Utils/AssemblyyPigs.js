"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckAndSendAssemblyPigEmbeds = void 0;
const UserInfo_1 = require("../database/UserInfo");
const Bot_1 = require("../Bot");
const Pigs_1 = require("../database/Pigs");
const ServerInfo_1 = require("../database/ServerInfo");
const discord_js_1 = require("discord.js");
const PigRenderer_1 = require("./PigRenderer");
const SendMessage_1 = require("./SendMessage");
function GetPossibleAssemblyPigs(userInfo) {
    const allAssemblyPigs = (0, Pigs_1.GetPigsByRarity)("Assembly");
    return allAssemblyPigs.filter(pig => !userInfo.AssembledPigs.includes(pig.ID));
}
function GetUserPigIDs(userInfo, newPigs) {
    const userPigs = [];
    for (const key in userInfo.Pigs) {
        userPigs.push(key);
    }
    newPigs.filter(pig => !userPigs.includes(pig.ID)).forEach(pig => userPigs.push(pig.ID));
    return userPigs;
}
function GetCompletedPigs(possibleAssemblyPigs, userPigIds) {
    const completedPigs = [];
    let previousCompletedPigsNum = completedPigs.length;
    do {
        previousCompletedPigsNum = completedPigs.length;
        possibleAssemblyPigs.filter(assemblyPig => {
            const requiredPigs = assemblyPig.RequiredPigs;
            return requiredPigs.every(requiredPig => userPigIds.includes(requiredPig));
        }).forEach(assemblyPig => {
            completedPigs.push(assemblyPig);
            userPigIds.push(assemblyPig.ID);
        });
        possibleAssemblyPigs = possibleAssemblyPigs.filter(pig => !completedPigs.includes(pig));
    } while (previousCompletedPigsNum !== completedPigs.length);
    return completedPigs;
}
async function SendAssemblyPigEmbed(serverInfo, userInfo, completedPig) {
    if (serverInfo.Channel === undefined) {
        return;
    }
    const user = await Bot_1.client.users.fetch(userInfo.ID);
    const assemblyPigEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("You've completed a set and obtained a bonus pig!")
        .setAuthor({
        name: user.username,
        iconURL: user.avatarURL() ?? undefined
    });
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(assemblyPigEmbed, {
        pig: completedPig,
        new: true
    });
    (0, SendMessage_1.TrySendMessageToChannel)(serverInfo.ID, serverInfo.Channel, {
        embeds: [assemblyPigEmbed],
        files: [imgPath]
    });
}
async function CheckAndSendAssemblyPigEmbeds(serverId, userId, newPigs) {
    const serverInfo = await (0, ServerInfo_1.GetServerInfo)(serverId);
    if (serverInfo === undefined) {
        return;
    }
    if (serverInfo.Channel === undefined) {
        return;
    }
    const userInfo = await (0, UserInfo_1.GetUserInfo)(userId);
    if (userInfo === undefined) {
        return;
    }
    const possibleAssemblyPigs = GetPossibleAssemblyPigs(userInfo);
    const userPigIDs = GetUserPigIDs(userInfo, newPigs);
    const completedPigs = GetCompletedPigs(possibleAssemblyPigs, userPigIDs);
    completedPigs.forEach(pig => {
        if (userInfo.Pigs[pig.ID] === undefined) {
            userInfo.Pigs[pig.ID] = 1;
        }
        else {
            userInfo.Pigs[pig.ID]++;
        }
        userInfo.AssembledPigs.push(pig.ID);
        SendAssemblyPigEmbed(serverInfo, userInfo, pig);
    });
    return completedPigs;
}
exports.CheckAndSendAssemblyPigEmbeds = CheckAndSendAssemblyPigEmbeds;
