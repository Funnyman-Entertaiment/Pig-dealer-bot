"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBotRole = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const ServerInfo_1 = require("../database/ServerInfo");
const Command_1 = require("../Command");
exports.SetBotRole = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("setrole")
    .addRoleOption(option => option.setName('role')
    .setDescription('role that will get pinged when the bot drops a pack')
    .setRequired(true))
    .setDescription("Let's you choose what role the bot pings")
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator), async (_, interaction, db) => {
    const role = interaction.options.getRole('role');
    if (role === null) {
        return;
    }
    if (interaction.guildId === null) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("There was an error fetching the server id.")
            .setColor(discord_js_1.Colors.Red);
        await interaction.followUp({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    let serverInfo = await (0, ServerInfo_1.GetServerInfo)(interaction.guildId, db);
    if (serverInfo === undefined) {
        serverInfo = new ServerInfo_1.ServerInfo(interaction.guildId, undefined, role.id, false);
    }
    else {
        serverInfo.Role = role.id;
    }
    await (0, lite_1.setDoc)((0, lite_1.doc)(db, `serverInfo/${serverInfo.ID}`), serverInfo.GetData());
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Role succesfully set to @${role.name}`)
        .setColor(discord_js_1.Colors.Green);
    await interaction.followUp({
        ephemeral: true,
        embeds: [successEmbed],
    });
});
