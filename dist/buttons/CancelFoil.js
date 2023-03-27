"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelFoil = void 0;
const discord_js_1 = require("discord.js");
const Button_1 = require("../Button");
const MessageInfo_1 = require("../database/MessageInfo");
exports.CancelFoil = new Button_1.Button("CancelFoil", false, true, true, async (interaction, _serverInfo, messageInfo, userInfo) => {
    if (messageInfo === undefined) {
        return;
    }
    if (userInfo === undefined) {
        return;
    }
    const user = interaction.user;
    const message = interaction.message;
    const msgInfo = messageInfo;
    if (msgInfo === undefined) {
        return;
    }
    (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
    const notEnoughPigsEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("This foil crafting has been cancelled")
        .setAuthor({
        name: user.username,
        iconURL: user.avatarURL() ?? user.defaultAvatarURL
    })
        .setColor(discord_js_1.Colors.DarkRed);
    message.edit({
        embeds: [notEnoughPigsEmbed],
        components: []
    });
    interaction.deferUpdate();
});
