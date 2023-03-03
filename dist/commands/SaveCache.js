"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveCache = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const UserInfo_1 = require("../database/UserInfo");
const ServerInfo_1 = require("../database/ServerInfo");
exports.SaveCache = new Command_1.Command("", "", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("savecache")
    .setDescription("Saves all cache to the db"), async (interaction) => {
    await interaction.deferReply();
    (0, ServerInfo_1.SaveAllServerInfo)();
    (0, UserInfo_1.SaveAllUserInfo)();
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Caches saved correctly")
        .setColor(discord_js_1.Colors.Green);
    await interaction.followUp({
        embeds: [successEmbed]
    });
});
