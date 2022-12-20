"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
exports.Announcement = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("announcement")
    .addSubcommand(subcommand => subcommand
    .setName("new")
    .setDescription("Creates a new announcement")
    .addStringOption(option => option
    .setName("title")
    .setDescription("The title the announcement embed will have"))
    .addStringOption(option => option
    .setName("description")
    .setDescription("The description the announcement embed will have")))
    .addSubcommand(subcommand => subcommand
    .setName("addField")
    .setDescription("Adds a new field")
    .addStringOption(option => option
    .setName("title")
    .setDescription("The title the new field will have"))
    .addStringOption(option => option
    .setName("description")
    .setDescription("The description the new field will have")))
    .setDescription("Manages everything about announcements"), async (_client, interaction) => {
    const content = `I'm not having sex with you right now ${interaction.user.username}.`;
    await interaction.followUp({
        ephemeral: true,
        content
    });
});
