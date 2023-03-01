"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSafeMode = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("src/Command");
const ServerInfo_1 = require("src/database/ServerInfo");
exports.SetSafeMode = new Command_1.Command("SetSafeMode", "Sets the safe mode for this server.", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("setsafemode")
    .addBooleanOption(option => option.setName('safe')
    .setDescription('Whether to set safe mode or not')
    .setRequired(true))
    .setDescription("Let's you choose if safe mode is active for this server")
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .setDMPermission(false), async (interaction) => {
    const safeMode = interaction.options.getBoolean('safe', true);
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
    let serverInfo = await (0, ServerInfo_1.GetServerInfo)(interaction.guildId);
    if (serverInfo === undefined) {
        serverInfo = new ServerInfo_1.ServerInfo(interaction.guildId, undefined, undefined, undefined, false, [], [], safeMode, true);
    }
    else {
        serverInfo.SafeMode = safeMode;
    }
    await (0, ServerInfo_1.AddServerInfoToCache)(serverInfo);
    (0, ServerInfo_1.SaveAllServerInfo)();
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Safe mode succesfully ${safeMode ? "enabled" : "disabled"}`)
        .setColor(discord_js_1.Colors.Green);
    await interaction.reply({
        ephemeral: true,
        embeds: [successEmbed],
    });
});
