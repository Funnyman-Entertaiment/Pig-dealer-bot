"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sex = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
exports.Sex = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("sex2")
    .setDescription("sex"), async (_client, interaction) => {
    const content = `I'm not having sex with you right now ${interaction.user.username}.`;
    await interaction.followUp({
        ephemeral: true,
        content
    });
});
