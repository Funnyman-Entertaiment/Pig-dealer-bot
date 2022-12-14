"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveRole = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Errors_1 = require("../Utils/Errors");
const ServerInfo_1 = require("../database/ServerInfo");
exports.RemoveRole = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Remove the pig collector role from you in this server")
    .setDMPermission(false), async function (interaction) {
    const server = interaction.guild;
    const channel = interaction.channel;
    const user = interaction.user;
    if (server === null) {
        return;
    }
    if (channel === null) {
        return;
    }
    const serverInfo = await (0, ServerInfo_1.GetServerInfo)(server.id);
    if (serverInfo === undefined || serverInfo.Role === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("This server doesn't have a pig collector role set")
            .setDescription("Ask the server admins to use the `/setrole` command to select a role that will get pinged everytime a pack drops.")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed]
        });
        return;
    }
    const me = server.members.me;
    if (me === null) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't find bot user in server`, `Server: ${server.id}`);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const permissions = me.permissionsIn(channel);
    if (!permissions.has(discord_js_1.PermissionFlagsBits.ManageRoles)) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`The bot doesn't have enough persmissions to remove roles in this server`)
            .setDescription(`Ask the admins to give the bot permissions to manage roles`)
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed]
        });
        return;
    }
    await interaction.deferReply();
    const roleID = serverInfo.Role;
    const member = await server.members.fetch(user.id);
    const role = await server.roles.fetch(roleID);
    if (role === null) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`The role couldn't be found`)
            .setDescription(`Ask the admins to use the \`/setrole\` command again.`)
            .setColor(discord_js_1.Colors.Red);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    member.roles.remove(role);
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`The pig collector role has been succesfully removed!`)
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
});
