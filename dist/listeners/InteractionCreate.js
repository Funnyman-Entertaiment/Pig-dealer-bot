"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Buttons_1 = require("../Buttons");
const Commands_1 = require("../Commands");
const Bot_1 = require("../Bot");
const ServerInfo_1 = require("../database/ServerInfo");
const Errors_1 = require("../Utils/Errors");
const UserInfo_1 = require("../database/UserInfo");
const MessageInfo_1 = require("../database/MessageInfo");
exports.default = () => {
    Bot_1.client.on("interactionCreate", async (interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(interaction);
        }
        else if (interaction.isButton()) {
            await handleButtonCommand(interaction);
        }
    });
};
const handleSlashCommand = async (interaction) => {
    let slashCommand = Commands_1.Commands.find(c => c.slashCommand.name === interaction.commandName);
    if (slashCommand === undefined) {
        slashCommand = Commands_1.TradeServerCommands.find(c => c.slashCommand.name === interaction.commandName);
    }
    if (slashCommand === undefined) {
        slashCommand = Commands_1.DebugCommands.find(c => c.slashCommand.name === interaction.commandName);
    }
    if (slashCommand === undefined) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }
    let serverInfo = undefined;
    if (slashCommand.requireServerInfo) {
        const serverId = interaction.guildId;
        if (serverId === null) {
            const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't fetch server id", "Where did you use this command?");
            await interaction.reply({
                embeds: [errorEmbed]
            });
            return;
        }
        serverInfo = await (0, ServerInfo_1.GetServerInfo)(serverId);
        if (serverInfo === undefined) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("This server is not properly set up")
                .setDescription("An admin may need to use /setchannel before this feature can work properly")
                .setColor(discord_js_1.Colors.DarkRed);
            await interaction.reply({
                embeds: [errorEmbed]
            });
            return;
        }
    }
    let userInfo = undefined;
    if (slashCommand.requireUserInfo) {
        const userId = interaction.user.id;
        userInfo = await (0, UserInfo_1.GetUserInfo)(userId);
        if (userInfo === undefined) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("You have no pigs!")
                .setDescription("Open some packs loser")
                .setColor(discord_js_1.Colors.DarkRed);
            await interaction.reply({
                embeds: [errorEmbed]
            });
            return;
        }
    }
    slashCommand.response(interaction, serverInfo, userInfo);
};
const handleButtonCommand = async (interaction) => {
    const button = Buttons_1.Buttons.find(b => b.id === interaction.customId);
    if (!button) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }
    let serverInfo = undefined;
    if (button.requireServerInfo) {
        const serverId = interaction.guildId;
        if (serverId === null) {
            const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't fetch server id", "Where did you use this command?");
            await interaction.reply({
                embeds: [errorEmbed]
            });
            return;
        }
        serverInfo = await (0, ServerInfo_1.GetServerInfo)(serverId);
        if (serverInfo === undefined) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("This server is not properly set up")
                .setDescription("An admin may need to use /setchannel before this command can work properly")
                .setColor(discord_js_1.Colors.DarkRed);
            await interaction.reply({
                embeds: [errorEmbed]
            });
            return;
        }
    }
    let messageInfo = undefined;
    if (button.requireMessageInfo) {
        const serverId = interaction.guildId;
        if (serverId === null) {
            const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Couldn't fetch server id", "Where did you use this command?");
            await interaction.reply({
                embeds: [errorEmbed]
            });
            return;
        }
        const messageId = interaction.message.id;
        messageInfo = (0, MessageInfo_1.GetMessageInfo)(serverId, messageId);
        if (messageInfo === undefined) {
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
        const userId = interaction.user.id;
        if (messageInfo.User !== undefined &&
            messageInfo.User !== userId) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("This isn't for you!")
                .setDescription("Shoo shoo!")
                .setColor(discord_js_1.Colors.Red);
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
            return;
        }
    }
    let userInfo = undefined;
    if (button.requireUserInfo) {
        const userId = interaction.user.id;
        userInfo = await (0, UserInfo_1.GetUserInfo)(userId);
        if (userInfo === undefined) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("You have no pigs!")
                .setDescription("Open some packs loser")
                .setColor(discord_js_1.Colors.DarkRed);
            await interaction.reply({
                embeds: [errorEmbed]
            });
            return;
        }
    }
    button.response(interaction, serverInfo, messageInfo, userInfo);
};
