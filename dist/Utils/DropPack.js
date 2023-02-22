"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropPack = void 0;
const discord_js_1 = require("discord.js");
const Bot_1 = require("../Bot");
const ColorPerPackRarity_1 = require("../Constants/ColorPerPackRarity");
const ServerInfo_1 = require("../database/ServerInfo");
const MessageInfo_1 = require("../database/MessageInfo");
const Log_1 = require("./Log");
const SendMessage_1 = require("./SendMessage");
async function DropPack(serverInfo, options) {
    if (!serverInfo.Enabled) {
        return;
    }
    let server = undefined;
    try {
        server = await Bot_1.client.guilds.fetch(serverInfo.ID);
    }
    catch {
        (0, Log_1.LogWarn)(`Missing access to server ${serverInfo.ID}. Disabling server.`);
        serverInfo.Enabled = false;
        await (0, ServerInfo_1.AddServerInfoToCache)(serverInfo);
        (0, ServerInfo_1.SaveAllServerInfo)();
    }
    if (server === undefined) {
        return;
    }
    if (serverInfo.Channel === undefined) {
        (0, Log_1.LogWarn)(`Can't send pack to server ${(0, Log_1.PrintServer)(server)} because it doesn't have a set channel`);
        return;
    }
    const pack = options.pack;
    let img = `${pack.ID}.png`;
    const packEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(options.title)
        .setImage(`attachment://${img}`)
        .setColor(ColorPerPackRarity_1.COLOR_PER_PACK_RARITY[pack.Rarity]);
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('OpenPack')
        .setLabel('Open!')
        .setStyle(discord_js_1.ButtonStyle.Primary));
    (0, Log_1.LogInfo)(`Sending ${pack.Name} to server with id: ${(0, Log_1.PrintServer)(server)}`);
    if (serverInfo.Role !== undefined && (options.ping !== undefined && options.ping)) {
        (0, SendMessage_1.TrySendAutoRemoveMessage)(serverInfo.ID, serverInfo.Channel, {
            content: (0, discord_js_1.roleMention)(serverInfo.Role)
        });
    }
    const msgPromise = (0, SendMessage_1.TrySendMessageToChannel)(serverInfo.ID, serverInfo.Channel, {
        embeds: [packEmbed],
        components: [row],
        files: [`./img/packs/${img}`]
    });
    if (msgPromise === undefined) {
        return;
    }
    msgPromise.then(message => {
        if (message === undefined) {
            return;
        }
        if (server === undefined) {
            return;
        }
        const newMessage = new MessageInfo_1.RandomPackMessage(message.id, server.id, pack.ID, false, options.ignoreCooldown ?? false, options.userId);
        (0, MessageInfo_1.AddMessageInfoToCache)(newMessage);
    });
}
exports.DropPack = DropPack;
