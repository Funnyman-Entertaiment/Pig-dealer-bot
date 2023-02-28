"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
let announcementEmbed;
let annoucementFields = [];
function NewAnnouncement(interaction, options) {
    const title = options.getString("title");
    const description = options.getString("description");
    if (title === null) {
        return;
    }
    if (description === null) {
        return;
    }
    announcementEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(discord_js_1.Colors.LuminousVividPink);
    annoucementFields = [];
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Succesfully created new annoucement")
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
}
function AddField(interaction, options) {
    if (announcementEmbed === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(discord_js_1.Colors.Red);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const title = options.getString("title");
    const description = options.getString("description");
    if (title === null) {
        return;
    }
    if (description === null) {
        return;
    }
    annoucementFields.push({
        name: title,
        value: description,
        inline: false
    });
    announcementEmbed.setFields(annoucementFields);
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Succesfully added new field")
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
}
function ClearField(interaction) {
    if (announcementEmbed === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(discord_js_1.Colors.Red);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    annoucementFields.pop();
    announcementEmbed.setFields(annoucementFields);
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Succesfully removed last field")
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
}
function RemoveAnnoucement(interaction) {
    announcementEmbed = undefined;
    annoucementFields = [];
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Succesfully removed the announcement embed")
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
}
function ShowAnnoucement(interaction) {
    if (announcementEmbed === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(discord_js_1.Colors.Red);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    interaction.followUp({
        embeds: [announcementEmbed]
    });
}
async function SendAnnouncement(interaction) {
    if (announcementEmbed === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(discord_js_1.Colors.Red);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const embed = new discord_js_1.EmbedBuilder(announcementEmbed?.data);
    embed.addFields({
        name: "JOIN THE DISCORD",
        value: "In case you didn't know, we have a Discord server dedicated to collecting and trading pigs, with pig emotes, exclusive features and a lovely community! Make sure to stop by, we'd love to see you there!"
    });
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setLabel("Invite the bot!")
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setURL("https://discord.com/api/oauth2/authorize?client_id=1040735137228406884&permissions=268470272&scope=bot%20applications.commands"), new discord_js_1.ButtonBuilder()
        .setLabel("Join the server!")
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setURL("https://discord.gg/wnAnhRyKjM"));
    const q = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(q);
    servers.forEach(async (server) => {
        if (server.data().Channel === undefined && server.data().AnnouncementChannel === undefined) {
            return;
        }
        try {
            const channelID = server.data().AnnouncementChannel ?? server.data().Channel;
            await Bot_1.client.channels.fetch(channelID).then(async (channel) => {
                if (channel === null) {
                    return;
                }
                const guild = await Bot_1.client.guilds.fetch(server.id);
                const permissions = guild.members.me?.permissionsIn(channel);
                if (permissions === undefined) {
                    return;
                }
                if (!permissions.has("SendMessages") || !permissions.has("ViewChannel")) {
                    return;
                }
                if (server.data().Role !== undefined) {
                    channel.send({
                        content: (0, discord_js_1.roleMention)(server.data().Role),
                        embeds: [embed],
                        components: [row]
                    });
                }
                else {
                    channel.send({
                        embeds: [embed],
                        components: [row]
                    });
                }
            });
        }
        catch (error) {
        }
    });
    announcementEmbed = undefined;
    annoucementFields = [];
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Succesfully sent announcement")
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
}
exports.Announcement = new Command_1.Command("", "", new discord_js_1.SlashCommandBuilder()
    .setName("announcement")
    .addSubcommand(subcommand => subcommand
    .setName("new")
    .setDescription("Creates a new announcement")
    .addStringOption(option => option
    .setName("title")
    .setDescription("The title the announcement embed will have")
    .setRequired(true))
    .addStringOption(option => option
    .setName("description")
    .setDescription("The description the announcement embed will have")
    .setRequired(true)))
    .addSubcommand(subcommand => subcommand
    .setName("addfield")
    .setDescription("Adds a new field")
    .addStringOption(option => option
    .setName("title")
    .setDescription("The title the new field will have")
    .setRequired(true))
    .addStringOption(option => option
    .setName("description")
    .setDescription("The description the new field will have")
    .setRequired(true)))
    .addSubcommand(subcommand => subcommand
    .setName("clearfield")
    .setDescription("Removes the last field"))
    .addSubcommand(subcommand => subcommand
    .setName("remove")
    .setDescription("Removes the whole announcement embed"))
    .addSubcommand(subcommand => subcommand
    .setName("show")
    .setDescription("Displays the current annoucement embed"))
    .addSubcommand(subcommand => subcommand
    .setName("send")
    .setDescription("Sends the embed announcement to every server the bot is in"))
    .setDescription("Manages everything about announcements"), async (interaction) => {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === undefined) {
        return;
    }
    switch (subcommand) {
        case ("new"):
            NewAnnouncement(interaction, interaction.options);
            break;
        case ("addfield"):
            AddField(interaction, interaction.options);
            break;
        case ("clearfield"):
            ClearField(interaction);
            break;
        case ("remove"):
            RemoveAnnoucement(interaction);
            break;
        case ("show"):
            ShowAnnoucement(interaction);
            break;
        case ("send"):
            SendAnnouncement(interaction);
            break;
    }
});
