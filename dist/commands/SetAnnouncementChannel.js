"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetAnnouncementChannel = void 0;
const discord_js_1 = require("discord.js");
const ServerInfo_1 = require("../database/ServerInfo");
const Command_1 = require("../Command");
const Log_1 = require("../Utils/Log");
exports.SetAnnouncementChannel = new Command_1.Command("Set Announcement Channel", "Only available to users with administrative access to the server. Defines what channel the bot will send announcements to. By default it is the same one as the one it drops packs in.", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("setannouncementchannel")
    .addChannelOption(option => option.setName('channel')
    .setDescription('channel to send announcements')
    .addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setRequired(true))
    .setDescription("Let's you choose what channel the bot sends announcements to")
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
    const channel = interaction.options.getChannel('channel', true);
    (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is setting the dropping channel to ${(0, Log_1.PrintChannel)(channel)} in server ${(0, Log_1.PrintServer)(server)}`);
    serverInfo.AnnouncementChannel = channel.id;
    await (0, ServerInfo_1.AddServerInfoToCache)(serverInfo);
    (0, ServerInfo_1.SaveAllServerInfo)();
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Channel succesfully set to ${channel.name}`)
        .setColor(discord_js_1.Colors.Green);
    await interaction.reply({
        ephemeral: true,
        embeds: [successEmbed],
    });
});
