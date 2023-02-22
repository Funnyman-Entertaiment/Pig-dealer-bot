"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelFoil = void 0;
const discord_js_1 = require("discord.js");
const Button_1 = require("../Button");
const MessageInfo_1 = require("../database/MessageInfo");
const UserInfo_1 = require("../database/UserInfo");
function ChooseRandomPigFromList(pigs) {
    return pigs[Math.floor(Math.random() * pigs.length)];
}
exports.CancelFoil = new Button_1.Button("CancelFoil", async (interaction) => {
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const message = interaction.message;
    const user = interaction.user;
    const msgInfo = (0, MessageInfo_1.GetMessageInfo)(server.id, message.id);
    if (msgInfo === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("This message has expired")
            .setDescription("Trade messages expire after ~15 minutes of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    if (msgInfo.Type !== "PigFoil") {
        return;
    }
    if (msgInfo.User !== user.id) {
        return;
    }
    const userInfo = await (0, UserInfo_1.GetUserInfo)(user.id);
    if (userInfo === undefined) {
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
