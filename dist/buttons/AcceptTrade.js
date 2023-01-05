"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptTrade = void 0;
const UserInfo_1 = require("../database/UserInfo");
const Button_1 = require("../Button");
const MessageInfo_1 = require("../database/MessageInfo");
const Errors_1 = require("../Utils/Errors");
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const AssemblyyPigs_1 = require("../Utils/AssemblyyPigs");
const Pigs_1 = require("../database/Pigs");
function RemoveOfferedPigsFromUser(userInfo, pigOffer) {
    let hasAddedPig = false;
    for (const pigID in pigOffer) {
        hasAddedPig = true;
        const pigAmount = pigOffer[pigID];
        const originalAmount = userInfo.Pigs[pigID];
        userInfo.Pigs[pigID] = Math.max(0, originalAmount - pigAmount);
        if (userInfo.Pigs[pigID] <= 0) {
            delete userInfo.Pigs[pigID];
        }
    }
    return hasAddedPig;
}
function AddOfferedPigsToUser(userInfo, pigOffer) {
    const pigsAdded = [];
    for (const pigID in pigOffer) {
        const pigAmount = pigOffer[pigID];
        const originalAmount = userInfo.Pigs[pigID] ?? 0;
        userInfo.Pigs[pigID] = originalAmount + pigAmount;
        if (!pigsAdded.some(pig => pig.ID === pigID)) {
            const pig = (0, Pigs_1.GetPig)(pigID);
            if (pig !== undefined) {
                pigsAdded.push(pig);
            }
        }
    }
    return pigsAdded;
}
exports.AcceptTrade = new Button_1.Button("AcceptTrade", async (interaction) => {
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const message = interaction.message;
    const user = interaction.user;
    const msgInfo = (0, MessageInfo_1.GetMessageInfo)(server.id, message.id);
    if (msgInfo === undefined) {
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("This message has expired")
            .setDescription("Trade messages expire after ~15 minutes of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    if (msgInfo.Type !== "PigTrade") {
        return;
    }
    if (msgInfo.User !== user.id) {
        return;
    }
    const starterInfo = await (0, UserInfo_1.GetUserInfo)(msgInfo.TradeStarterID) ?? new UserInfo_1.UserInfo(msgInfo.TradeStarterID, [], {});
    const receiverInfo = await (0, UserInfo_1.GetUserInfo)(msgInfo.TradeReceiverID) ?? new UserInfo_1.UserInfo(msgInfo.TradeReceiverID, [], {});
    await (0, UserInfo_1.AddUserInfosToCache)([starterInfo, receiverInfo]);
    const hasAddedPigToStarter = RemoveOfferedPigsFromUser(starterInfo, msgInfo.TradeStarterOffer);
    const hasAddedPigToReceiver = RemoveOfferedPigsFromUser(receiverInfo, msgInfo.TradeReceiverOffer);
    const pigsAddedToStarter = AddOfferedPigsToUser(starterInfo, msgInfo.TradeReceiverOffer);
    const pigsAddedToReceiver = AddOfferedPigsToUser(receiverInfo, msgInfo.TradeStarterOffer);
    (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
    (0, AssemblyyPigs_1.CheckAndSendAssemblyPigEmbeds)(server.id, msgInfo.TradeStarterID, pigsAddedToStarter);
    (0, AssemblyyPigs_1.CheckAndSendAssemblyPigEmbeds)(server.id, msgInfo.TradeReceiverID, pigsAddedToReceiver);
    const embed = message.embeds[0];
    if (embed === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't retrieve the embed from the trade message`, `Make sure the bot is able to send embeds in this server`, `(The trade has been succesful anyways)`);
        interaction.reply({
            embeds: [errorEmbed]
        });
    }
    const editedEmbed = new builders_1.EmbedBuilder(embed.data)
        .setColor(discord_js_1.Colors.Green);
    if (hasAddedPigToReceiver || hasAddedPigToStarter) {
        editedEmbed.setDescription("The pigs have been succesfully traded!");
    }
    else {
        editedEmbed.setDescription("Trade done, but what did you accomplish with this");
    }
    message.edit({
        embeds: [editedEmbed],
        components: []
    });
});
