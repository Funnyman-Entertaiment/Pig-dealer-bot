"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeBulletin = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Variables_1 = require("../Constants/Variables");
const GetAuthor_1 = require("../Utils/GetAuthor");
const UserInfo_1 = require("../database/UserInfo");
async function AddTradeBulletin(interaction, userInfo, options) {
    if (userInfo.BulletinMsgId !== undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You can only have one trade offer in the bulletin at the time!")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const set = options.getString('set', true);
    const tradeBulletinEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${interaction.user.username} wants to trade!`)
        .setDescription(`They're looking for pigs in the ${set} set.`)
        .setColor(discord_js_1.Colors.DarkVividPink)
        .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
    const message = await Variables_1.TradeServerSpace.TradeBulletinChannel.send({
        embeds: [tradeBulletinEmbed]
    });
    userInfo.BulletinMsgId = message.id;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Trade bulletin succesfully sent!")
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
}
async function RemoveTradeBulletin(interaction, userInfo) {
    if (userInfo.BulletinMsgId === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You don't have a trade bulletin to delete!")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    let message;
    try {
        message = await Variables_1.TradeServerSpace.TradeBulletinChannel.messages.fetch(userInfo.BulletinMsgId);
        message.delete();
    }
    catch { }
    userInfo.BulletinMsgId = undefined;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Trade bulletin succesfully removed!")
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
}
exports.TradeBulletin = new Command_1.Command("Trade Bulletin", "Only available on the Pig Dealer Trading Forum.\n Use `/tradebulletin add` to post a text embed to the dedicated channel, used for finding trade partners.\nIf you wish to remove a bulletin, use `/tradebulletin` remove.", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("tradebulletin")
    .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
    .setName("add")
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("set")
    .setDescription("Set you're interested in trading.")
    .setRequired(true))
    .setDescription("Post a trade offer in the bulletin."))
    .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Remove you trade offer from the bulletin."))
    .setDMPermission(false)
    .setDescription("Post offers in ."), async (interaction) => {
    const options = interaction.options;
    const subcommand = options.getSubcommand();
    if (subcommand === undefined) {
        return;
    }
    const userInfo = await (0, UserInfo_1.GetUserInfo)(interaction.user.id) ?? new UserInfo_1.UserInfo(interaction.user.id, [], {}, false, []);
    switch (subcommand) {
        case ("add"):
            AddTradeBulletin(interaction, userInfo, options);
            break;
        case ("remove"):
            RemoveTradeBulletin(interaction, userInfo);
            break;
    }
});
