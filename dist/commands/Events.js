"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const SeasonalEvents_1 = require("../seasonalEvents/SeasonalEvents");
exports.Events = new Command_1.Command("Events", "Shows information about the current events going on.", new discord_js_1.SlashCommandBuilder()
    .setName("events")
    .setDescription("Gives some information about the events that are currently going on, if any."), async (interaction) => {
    const activeEvents = (0, SeasonalEvents_1.GetActiveEvents)();
    if (activeEvents.length === 0) {
        const noEventsEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("There are no events going on!")
            .setDescription("What a bummer...")
            .setColor(discord_js_1.Colors.DarkVividPink);
        interaction.reply({
            embeds: [noEventsEmbed]
        });
        return;
    }
    const eventsEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("There are some events going on!")
        .setColor(discord_js_1.Colors.DarkVividPink);
    activeEvents.forEach(event => {
        eventsEmbed.addFields({
            name: event.Name,
            value: event.Description,
            inline: false
        });
    });
    interaction.reply({
        embeds: [eventsEmbed]
    });
});
