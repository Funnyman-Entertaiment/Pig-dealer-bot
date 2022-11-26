"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Buttons_1 = require("../Buttons");
const Commands_1 = require("../Commands");
exports.default = (client, db) => {
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction, db);
        }
        else if (interaction.isButton()) {
            await handleButtonCommand(client, interaction, db);
        }
    });
};
const handleSlashCommand = async (client, interaction, db) => {
    const slashCommand = Commands_1.Commands.find(c => c.slashCommand.name === interaction.commandName);
    if (!slashCommand) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }
    await interaction.deferReply();
    slashCommand.response(client, interaction, db);
};
const handleButtonCommand = async (client, interaction, db) => {
    const button = Buttons_1.Buttons.find(c => c.id === interaction.customId);
    if (!button) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }
    button.response(client, interaction, db);
};
