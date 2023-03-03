"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBotRole = void 0;
const discord_js_1 = require("discord.js");
const ServerInfo_1 = require("../database/ServerInfo");
const Command_1 = require("../Command");
const Log_1 = require("src/Utils/Log");
exports.SetBotRole = new Command_1.Command("Set Role", "Only available to users with administrative access to the server. It will define what role the bot pings when a new pack drops, or when an announcement is made.", true, false, new discord_js_1.SlashCommandBuilder()
    .setName("setrole")
    .addRoleOption(option => option.setName('role')
    .setDescription('role that will get pinged when the bot drops a pack')
    .setRequired(true))
    .setDescription("Let's you choose what role the bot pings")
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .setDMPermission(false), async (interaction, serverInfo) => {
    const server = interaction.guild;
    if (server === null) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("There was an error fetching the server id.")
            .setColor(discord_js_1.Colors.Red);
        await interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    if (serverInfo === undefined) {
        serverInfo = (0, ServerInfo_1.CreateNewDefaultServerInfo)(server.id);
    }
    const role = interaction.options.getRole('role', true);
    (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is setting the dropping channel to ${role.name} in server ${(0, Log_1.PrintServer)(server)}`);
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
