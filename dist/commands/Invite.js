"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Log_1 = require("../Utils/Log");
const Links_1 = require("src/Constants/Links");
exports.Invite = new Command_1.Command("Invite", "Gives you the bot invite link.", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("invite")
    .setDescription("Sends you an invitation link so you can have Pig Dealer in your own server."), async (interaction) => {
    (0, Log_1.LogInfo)(`Sending bot invite to user ${(0, Log_1.PrintUser)(interaction.user)}`);
    if (interaction.guild === null) {
        interaction.reply(Links_1.BOT_INVITE_LINK);
    }
    else {
        interaction.user.send(Links_1.BOT_INVITE_LINK);
        interaction.reply({
            content: "Message sent!",
            ephemeral: true
        });
    }
});
