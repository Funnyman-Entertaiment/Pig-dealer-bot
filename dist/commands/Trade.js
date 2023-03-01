"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const GetAuthor_1 = require("../Utils/GetAuthor");
const MessageInfo_1 = require("../database/MessageInfo");
const UserInfo_1 = require("../database/UserInfo");
const Bot_1 = require("../Bot");
const Errors_1 = require("../Utils/Errors");
const Log_1 = require("../Utils/Log");
function ParseTradePigsString(interaction, pigsString) {
    if (pigsString.trim() === "") {
        return {};
    }
    const pigTokens = pigsString.split(',');
    const pigAmounts = {};
    let hasFoundNonPig = undefined;
    let hasFoundUnformattedPig = undefined;
    pigTokens.forEach(token => {
        if (hasFoundNonPig !== undefined) {
            return;
        }
        if (hasFoundUnformattedPig !== undefined) {
            return;
        }
        const pigID = token.split('(')[0].trim();
        const pig = (0, Pigs_1.GetPig)(pigID);
        if (pig === undefined) {
            hasFoundNonPig = pigID;
            return;
        }
        const pigNumberStr = token.split('(')[1];
        let pigNumber = 1;
        if (pigNumberStr !== undefined) {
            pigNumber = parseInt(pigNumberStr.replace(')', '').trim());
        }
        if (Number.isNaN(pigNumber) || pigNumber <= 0) {
            hasFoundUnformattedPig = token;
            return;
        }
        if (pigAmounts[pigID] === undefined) {
            pigAmounts[pigID] = 0;
        }
        pigAmounts[pigID] += pigNumber;
    });
    if (hasFoundNonPig !== undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You're trying to give something that isn't a pig")
            .setDescription(`You need to type the pig's id, but you typed: ${hasFoundNonPig}`)
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return undefined;
    }
    if (hasFoundUnformattedPig !== undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You typed something wrong")
            .setDescription(`The bot found some issue trying to figure out what pigs you wanted to give from here: ${hasFoundUnformattedPig}`)
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return undefined;
    }
    return pigAmounts;
}
function GetFieldDescriptionFromPigAmounts(pigAmounts) {
    const descriptionLines = [];
    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const pig = (0, Pigs_1.GetPig)(pigID);
        if (pig === undefined) {
            continue;
        }
        descriptionLines.push(`${pig.Name} #${pig.ID.padStart(3, "0")} (${amount})`);
    }
    if (descriptionLines.length === 0) {
        descriptionLines.push("Nothing");
    }
    return descriptionLines.join("\n");
}
async function NewTrade(interaction, options) {
    const tradeStarter = interaction.user;
    const tradeReceiver = options.getUser("user", true);
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const channel = interaction.channel;
    if (channel === null) {
        return;
    }
    if (tradeReceiver.bot) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You can't trade with a bot")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    if (tradeStarter.id === tradeReceiver.id) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You can't trade with yourself silly!")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    if ((0, MessageInfo_1.IsUserInTrade)(tradeStarter.id)) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You're already on a trade!")
            .setDescription("Finish that trade before starting a new one")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    if ((0, MessageInfo_1.IsUserInTrade)(tradeReceiver.id)) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`${tradeReceiver.username} already on a trade!`)
            .setDescription("Wait for them to finish their trade")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    const starterInfo = await (0, UserInfo_1.GetUserInfo)(tradeStarter.id) ?? new UserInfo_1.UserInfo(tradeStarter.id, [], {}, false, []);
    const receiverInfo = await (0, UserInfo_1.GetUserInfo)(tradeReceiver.id) ?? new UserInfo_1.UserInfo(tradeReceiver.id, [], {}, false, []);
    await (0, UserInfo_1.AddUserInfosToCache)([starterInfo, receiverInfo]);
    const pigsString = options.getString("pigs") ?? "";
    const pigAmounts = ParseTradePigsString(interaction, pigsString);
    if (pigAmounts === undefined) {
        return;
    }
    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const owned = starterInfo.Pigs[pigID] ?? 0;
        if (amount > owned) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("You're trying to offer more pigs than what you actually own!")
                .setDescription(`For pig #${pigID.padStart(3, '0')} you're offering ${amount} when you actually have ${owned}`)
                .setColor(discord_js_1.Colors.Red);
            interaction.reply({
                ephemeral: true,
                embeds: [errorEmbed]
            });
            return;
        }
    }
    (0, Log_1.LogInfo)(`${(0, Log_1.PrintUser)(tradeStarter)} has started a trade with ${(0, Log_1.PrintUser)(tradeReceiver)} and is offering ${pigAmounts}`);
    await interaction.deferReply();
    const tradeEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${tradeStarter.username} wants to trade with ${tradeReceiver.username}`)
        .setDescription(`${tradeReceiver.username} can now click deny to cancel the trade or use the \`trade offer\` command to give your offer.`)
        .setAuthor((0, GetAuthor_1.GetAuthor)(interaction))
        .setColor(discord_js_1.Colors.DarkVividPink)
        .addFields([
        {
            name: `${tradeStarter.username}'s offer:`,
            value: GetFieldDescriptionFromPigAmounts(pigAmounts),
            inline: true
        },
        {
            name: `${tradeReceiver.username}'s offer:`,
            value: "...",
            inline: true
        }
    ]);
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("CancelTrade")
        .setLabel("Deny")
        .setStyle(discord_js_1.ButtonStyle.Danger));
    interaction.followUp({
        embeds: [tradeEmbed],
        components: [row]
    }).then(message => {
        const messageInfo = new MessageInfo_1.PigTradeMessage(message.id, server.id, tradeStarter.id, tradeReceiver.id, pigAmounts, {}, channel.id);
        (0, MessageInfo_1.AddMessageInfoToCache)(messageInfo);
    });
}
async function CounterOfferTrade(interaction, options) {
    const tradeReceiver = interaction.user;
    const msgInfo = (0, MessageInfo_1.GetTradeOfferForUser)(tradeReceiver.id);
    if (msgInfo === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You don't have a trade offer pending!")
            .setDescription("You can only use this command to you make an offer to an existing trade")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const starterInfo = await (0, UserInfo_1.GetUserInfo)(msgInfo.TradeStarterID) ?? new UserInfo_1.UserInfo(msgInfo.TradeStarterID, [], {}, false, []);
    const receiverInfo = await (0, UserInfo_1.GetUserInfo)(msgInfo.TradeReceiverID) ?? new UserInfo_1.UserInfo(msgInfo.TradeReceiverID, [], {}, false, []);
    await (0, UserInfo_1.AddUserInfosToCache)([starterInfo, receiverInfo]);
    const pigsString = options.getString("pigs") ?? "";
    const pigAmounts = ParseTradePigsString(interaction, pigsString);
    if (pigAmounts === undefined) {
        return;
    }
    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const owned = receiverInfo.Pigs[pigID] ?? 0;
        if (amount > owned) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("You're trying to offer more pigs than what you actually own!")
                .setDescription(`For pig #${pigID.padStart(3, '0')} you're offering ${amount} when you actually have ${owned}`)
                .setColor(discord_js_1.Colors.Red);
            interaction.reply({
                ephemeral: true,
                embeds: [errorEmbed]
            });
            return;
        }
    }
    msgInfo.TradeReceiverOffer = pigAmounts;
    const tradeServer = await Bot_1.client.guilds.fetch(msgInfo.ServerId);
    const tradeChannel = await tradeServer.channels.fetch(msgInfo.ChannelSentID);
    if (tradeChannel === null || !tradeChannel.isTextBased()) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Error fetching original channel of trade`, `The trade will be forcefully cancelled`, `Server: ${msgInfo.ServerId}`, `Channel: ${msgInfo.ChannelSentID}`);
        (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const tradeMessage = await tradeChannel.messages.fetch(msgInfo.ID);
    if (tradeMessage === null || tradeMessage === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Error fetching original trade message`, `If the message has been deleted this is expected`, `The trade will be forcefully cancelled`, `Server: ${msgInfo.ServerId}`, `Channel: ${msgInfo.ChannelSentID}`, `Message: ${msgInfo.ID}`);
        (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const tradeStarter = await tradeServer.members.fetch(msgInfo.TradeStarterID);
    if (tradeStarter === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Error fetching trade starter`, `The trade will be forcefully cancelled`, `Server: ${msgInfo.ServerId}`, `User: ${msgInfo.TradeStarterID}`);
        (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const originalEmbed = tradeMessage.embeds[0];
    if (originalEmbed === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Error fetching original trade embed`, `The trade will be forcefully cancelled`, `Server: ${msgInfo.ServerId}`, `Channel: ${msgInfo.ChannelSentID}`, `Message: ${msgInfo.ID}`);
        (0, MessageInfo_1.RemoveMessageInfoFromCache)(msgInfo);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const editedEmbed = new discord_js_1.EmbedBuilder(originalEmbed.data)
        .setDescription(`${tradeStarter.user.username} can now either accept or decline the offer.`)
        .setFields([
        {
            name: originalEmbed.fields[0].name,
            value: originalEmbed.fields[0].value,
            inline: true
        },
        {
            name: originalEmbed.fields[1].name,
            value: GetFieldDescriptionFromPigAmounts(pigAmounts),
            inline: true
        }
    ]);
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("CancelTrade")
        .setLabel("Deny")
        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
        .setCustomId("AcceptTrade")
        .setLabel("Accept")
        .setStyle(discord_js_1.ButtonStyle.Success));
    tradeMessage.edit({
        embeds: [editedEmbed],
        components: [row]
    }).then(() => {
        msgInfo.User = msgInfo.TradeStarterID;
    });
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Offer succesfully sent!")
        .setColor(discord_js_1.Colors.Green)
        .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
    interaction.reply({
        embeds: [successEmbed],
        ephemeral: true
    });
}
exports.Trade = new Command_1.Command("Trade", "Starts trade with a user.", true, false, new discord_js_1.SlashCommandBuilder()
    .setName("trade")
    .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
    .setName("start")
    .addUserOption(new discord_js_1.SlashCommandUserOption()
    .setName("user")
    .setDescription("User to trade with.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("pigs")
    .setDescription("Pigs that you offer."))
    .setDescription("Starts a trade with another user."))
    .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
    .setName("offer")
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("pigs")
    .setDescription("Pigs that you offer."))
    .setDescription("Make an offer to an existing trade."))
    .setDMPermission(false)
    .setDescription("Trade pigs with other users."), async (interaction) => {
    const options = interaction.options;
    const subcommand = options.getSubcommand();
    if (subcommand === undefined) {
        return;
    }
    switch (subcommand) {
        case ("start"):
            NewTrade(interaction, options);
            break;
        case ("offer"):
            CounterOfferTrade(interaction, options);
            break;
    }
});
