"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sex = void 0;
const discord_js_1 = require("discord.js");
const MessageInfo_1 = require("../database/MessageInfo");
const Command_1 = require("../Command");
exports.Sex = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("sex2")
    .setDescription("sex"), async (_client, interaction) => {
    const content = `I'm not having sex with you right now ${interaction.user.username}.`;
    const server = interaction.guild;
    if (server !== null) {
        console.log((0, MessageInfo_1.GetMsgInfoCacheForServer)(server.id).Elements);
    }
    await interaction.followUp({
        ephemeral: true,
        content
    });
});
