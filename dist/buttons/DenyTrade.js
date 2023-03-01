"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenyTrade = void 0;
const MessageInfo_1 = require("../database/MessageInfo");
const Button_1 = require("../Button");
const Errors_1 = require("../Utils/Errors");
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
exports.DenyTrade = new Button_1.Button("CancelTrade", true, true, false, async (interaction, serverInfo, messageInfo) => {
    if (serverInfo === undefined) {
        return;
    }
    if (messageInfo === undefined) {
        return;
    }
    const message = interaction.message;
    const user = interaction.user;
    const msgInfo = messageInfo;
    if (msgInfo === undefined) {
        return;
    }
    interaction.deferUpdate();
    (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
    const embed = message.embeds[0];
    if (embed === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't retreive the embed for this message!");
        interaction.followUp({
            embeds: [errorEmbed]
        });
    }
    const editedEmbed = new builders_1.EmbedBuilder(embed.data)
        .setDescription(`The trade has been cancelled by ${user.username}`)
        .setColor(discord_js_1.Colors.Red);
    message.edit({
        embeds: [editedEmbed],
        components: []
    });
});
