"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetBotChannel = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
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
    const docRef = (0, lite_1.doc)(db, "serverInfo", interaction.guildId);
    const serverInfo = await (0, lite_1.getDoc)(docRef);
    if (serverInfo.exists()) {
        await (0, lite_1.updateDoc)(docRef, {
            Channel: channel.id
        });
    }
    else {
        await (0, lite_1.setDoc)(docRef, {
            Channel: channel.id
        });
    }
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Channel succesfully set to ${channel.name}`)
        .setColor(discord_js_1.Colors.Green);
    await interaction.followUp({
        ephemeral: true,
        embeds: [successEmbed],
    });
});
