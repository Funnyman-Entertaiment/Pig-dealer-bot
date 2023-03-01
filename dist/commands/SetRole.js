"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBotRole = void 0;
const discord_js_1 = require("discord.js");
const ServerInfo_1 = require("../database/ServerInfo");
const Command_1 = require("../Command");
exports.SetBotRole = new Command_1.Command("SetRole", "Sets the role Pig Dealer will ping whenever a pack drops or a it sends a new announcement.", true, false, new discord_js_1.SlashCommandBuilder()
    .setName("setrole")
    .addRoleOption(option => option.setName('role')
    .setDescription('role that will get pinged when the bot drops a pack')
    .setRequired(true))
    .setDescription("Let's you choose what role the bot pings")
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .setDMPermission(false), async (interaction, serverInfo) => {
    if (serverInfo === undefined) {
        return;
    }
    const role = interaction.options.getRole('role', true);
    if (interaction.guildId === null) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("There was an error fetching the server id.")
            .setColor(discord_js_1.Colors.Red);
        await interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    serverInfo.Role = role.id;
    await (0, ServerInfo_1.AddServerInfoToCache)(serverInfo);
    (0, ServerInfo_1.SaveAllServerInfo)();
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Role succesfully set to @${role.name}`)
        .setColor(discord_js_1.Colors.Green);
    await interaction.reply({
        ephemeral: true,
        embeds: [successEmbed],
    });
});
