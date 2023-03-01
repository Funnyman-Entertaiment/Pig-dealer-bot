"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Log_1 = require("../Utils/Log");
exports.Invite = new Command_1.Command("Invite", "Sends you a link so you can invite Pig Dealer to your own server.", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("invite")
    .setDescription("Sends you an invitation link so you can have Pig Dealer in your own server."), async (interaction) => {
    (0, Log_1.LogInfo)(`Sending bot invite to user ${(0, Log_1.PrintUser)(interaction.user)}`);
    if (interaction.guild === null) {
        interaction.reply("https://discord.com/api/oauth2/authorize?client_id=1040735137228406884&permissions=268470272&scope=bot%20applications.commands");
    }
    else {
        interaction.user.send("https://discord.com/api/oauth2/authorize?client_id=1040735137228406884&permissions=268470272&scope=bot%20applications.commands");
        interaction.reply({
            content: "Message sent!",
            ephemeral: true
        });
    }
});
