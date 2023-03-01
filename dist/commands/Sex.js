"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sex = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
exports.Sex = new Command_1.Command("Ping", "Pings the bot to see if it's online.", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("ping")
    .setDescription("pong"), async (interaction) => {
    const content = `Hello ${interaction.user.username}!`;
    await interaction.reply({
        ephemeral: true,
        content
    });
});
