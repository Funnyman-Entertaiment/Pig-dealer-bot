"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropPack = void 0;
const discord_js_1 = require("discord.js");
const Bot_1 = require("../Bot");
const ColorPerPackRarity_1 = require("../Constants/ColorPerPackRarity");
const Errors_1 = require("./Errors");
const MessageInfo_1 = require("../database/MessageInfo");
const Log_1 = require("./Log");
function SendNotEnoughPermissionsMsg(channel, server) {
    const channelName = channel.name;
    const serverName = server.name;
    const ownerId = server.ownerId;
    const owner = Bot_1.client.users.cache.get(ownerId);
    const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Pig dealer is missing permissions", "Pig dealer doesn't have enough permissions for", `the ${channelName} channel in the ${serverName} server.`);
    if (owner === undefined) {
        console.log(`No owner has been found`);
    }
    else {
        owner.send({
            embeds: [errorEmbed]
        });
    }
}
function SendGhostPing(channel, roleId) {
    try {
        channel.send((0, discord_js_1.roleMention)(roleId)).then(message => message.delete());
    }
    catch (error) {
    }
}
async function DropPack(title, pack, channel, server, serverInfo, userId, ping = false) {
    if (channel.type !== discord_js_1.ChannelType.GuildText) {
        return;
    }
    if (server.id !== "1009766631364382731") {
        return;
    }
    let img = `${pack.ID}.png`;
    const packEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(title)
        .setImage(`attachment://${img}`)
        .setColor(ColorPerPackRarity_1.COLOR_PER_PACK_RARITY[pack.Rarity]);
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('OpenPack')
        .setLabel('Open!')
        .setStyle(discord_js_1.ButtonStyle.Primary));
    (0, Log_1.LogInfo)(`Sending ${pack.Name} to server with id: ${(0, Log_1.PrintServer)(server)}`);
    const permissions = server.members.me?.permissionsIn(channel);
    if (permissions === undefined) {
        return;
    }
    console.log(permissions.toArray());
    if (!permissions.has("SendMessages") || !permissions.has("ViewChannel")) {
        (0, Log_1.LogWarn)(`Not enough permissions to send messages in ${(0, Log_1.PrintServer)(server)}`);
        SendNotEnoughPermissionsMsg(channel, server);
        return;
    }
    if (serverInfo.Role !== undefined && ping) {
        SendGhostPing(channel, serverInfo.Role);
    }
    try {
        channel.send({
            components: [row],
            embeds: [packEmbed],
            files: [`./img/packs/${img}`]
        }).then(async (message) => {
            const newMessage = new MessageInfo_1.RandomPackMessage(message.id, server.id, pack.Name, pack.PigCount, pack.Set, pack.Tags, false, userId);
            (0, MessageInfo_1.AddMessageInfoToCache)(newMessage, Bot_1.db);
        });
    }
    catch (error) {
    }
}
exports.DropPack = DropPack;
