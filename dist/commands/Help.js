"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Help = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Commands_1 = require("../Commands");
const Commands_2 = require("../Commands");
const Variables_1 = require("../Constants/Variables");
const Bot_1 = require("../Bot");
exports.Help = new Command_1.Command("Help", "Shows useful information about every command", new discord_js_1.SlashCommandBuilder()
    .setName("help")
    .addStringOption(option => option.setName('command')
    .setDescription('Name of the command to learn more about.')
    .setRequired(true))
    .setDescription("Shows useful information about every command."), async function (interaction) {
    const commandName = interaction.options.getString('command', true).toLowerCase();
    let allowTradeForumCommands = false;
    const server = interaction.guild;
    if (server !== null) {
        allowTradeForumCommands = server.id === Variables_1.TradeServerSpace.Server.id;
    }
    let foundCommand = Commands_2.Commands.find(x => x.slashCommand.name.toLowerCase() === commandName);
    if (foundCommand === undefined && allowTradeForumCommands) {
        foundCommand = Commands_1.TradeServerCommands.find(x => x.slashCommand.name.toLowerCase() === commandName);
    }
    if (Bot_1.client.user === null) {
        return;
    }
    if (Bot_1.client.user.id === "1048616940194767009") {
        foundCommand = Commands_1.DebugCommands.find(x => x.slashCommand.name.toLowerCase() === commandName);
    }
    if (foundCommand === undefined) {
        const commandNotFoundEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("No matching command has been found")
            .setColor(discord_js_1.Colors.DarkRed);
        interaction.reply({
            embeds: [commandNotFoundEmbed],
            ephemeral: true
        });
        return;
    }
    const commandInfoEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(foundCommand.name)
        .setDescription(foundCommand.description)
        .setColor(discord_js_1.Colors.DarkVividPink);
    interaction.reply({
        embeds: [commandInfoEmbed],
        ephemeral: true
    });
});
