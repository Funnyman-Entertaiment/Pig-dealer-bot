"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptFoil = void 0;
const discord_js_1 = require("discord.js");
const Button_1 = require("../Button");
const PigRenderer_1 = require("../Utils/PigRenderer");
const MessageInfo_1 = require("../database/MessageInfo");
const Pigs_1 = require("../database/Pigs");
function ChooseRandomPigFromList(pigs) {
    return pigs[Math.floor(Math.random() * pigs.length)];
}
exports.AcceptFoil = new Button_1.Button("AcceptFoil", true, true, true, async (interaction, serverInfo, messageInfo, userInfo) => {
    if (serverInfo === undefined) {
        return;
    }
    if (messageInfo === undefined) {
        return;
    }
    if (userInfo === undefined) {
        return;
    }
    const msgInfo = messageInfo;
    if (msgInfo === undefined) {
        return;
    }
    const message = interaction.message;
    const user = interaction.user;
    (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
    const userPigs = userInfo.Pigs;
    const offeredPigs = msgInfo.OfferedPigs;
    let hasEnoughPigs = true;
    for (const id in offeredPigs) {
        const offeredAmount = offeredPigs[id];
        const userAmount = userPigs[id] ?? 0;
        if (offeredAmount > userAmount) {
            hasEnoughPigs = false;
        }
    }
    if (!hasEnoughPigs) {
        const notEnoughPigsEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You don't have enough pigs!")
            .setDescription("Did you complete a trade before crafting this foil?")
            .setAuthor({
            name: user.username,
            iconURL: user.avatarURL() ?? user.defaultAvatarURL
        })
            .setColor(discord_js_1.Colors.DarkRed);
        message.edit({
            embeds: [notEnoughPigsEmbed]
        });
        return;
    }
    for (const id in offeredPigs) {
        const offeredAmount = offeredPigs[id];
        const userAmount = userPigs[id] ?? 0;
        const newAmount = userAmount - offeredAmount;
        if (newAmount <= 0) {
            delete userPigs[id];
        }
        else {
            userPigs[id] = newAmount;
        }
    }
    const pigs = (0, Pigs_1.GetAllPigs)();
    const pigsOfSet = pigs.filter(pig => pig.Set.toLowerCase().trim() === msgInfo.Set.toLowerCase().trim());
    const pigsOfSetAndRarity = pigsOfSet.filter(pig => pig.Rarity === `${msgInfo.Rarity} (foil)`);
    const chosenFoil = ChooseRandomPigFromList(pigsOfSetAndRarity);
    const prevAmount = userPigs[chosenFoil.ID] ?? 0;
    userPigs[chosenFoil.ID] = prevAmount + 1;
    const foilPigEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${user.username} has crafted a foil pig!`)
        .setAuthor({
        name: user.username,
        iconURL: user.avatarURL() ?? user.defaultAvatarURL
    });
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(foilPigEmbed, {
        pig: chosenFoil,
        safe: serverInfo.SafeMode,
        count: prevAmount + 1,
        favourite: userInfo.FavouritePigs.includes(chosenFoil.ID),
        new: prevAmount == 0
    });
    interaction.reply({
        embeds: [foilPigEmbed],
        files: [imgPath]
    });
    message.edit({
        components: []
    });
});
