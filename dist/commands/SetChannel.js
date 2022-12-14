"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBotChannel = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const ServerInfo_1 = require("../database/ServerInfo");
const Command_1 = require("../Command");
exports.SetBotChannel = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("setchannel")
    .addChannelOption(option => option.setName('channel')
    .setDescription('channel to send packs')
    .setRequired(true))
    .setDescription("Let's you choose what channel the bot sends packs to"), async (_, interaction, db) => {
    const channel = interaction.options.getChannel('channel');
    if (channel === null) {
        return;
    }
    if (channel.type !== discord_js_1.ChannelType.GuildText) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Channel must be a text channel.")
            .setColor(discord_js_1.Colors.Red);
        await interaction.followUp({
            ephemeral: true,
            embeds: [errorEmbed]
        });
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
        serverInfo = new ServerInfo_1.ServerInfo(interaction.guildId, channel.id, false);
    }
    else {
        serverInfo.Channel = channel.id;
    }
    await (0, lite_1.setDoc)((0, lite_1.doc)(db, `$serverInfo/${serverInfo.ID}`), serverInfo.GetData());
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Channel succesfully set to ${channel.name}`)
        .setColor(discord_js_1.Colors.Green);
    await interaction.followUp({
        ephemeral: true,
        embeds: [successEmbed],
    });
});
