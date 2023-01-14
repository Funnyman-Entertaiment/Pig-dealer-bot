"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buttons_1 = require("../Buttons");
const Commands_1 = require("../Commands");
const Bot_1 = require("../Bot");
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
    slashCommand.response(interaction);
};
const handleButtonCommand = async (interaction) => {
    const button = Buttons_1.Buttons.find(b => b.id === interaction.customId);
    if (!button) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }
    button.response(interaction);
};
