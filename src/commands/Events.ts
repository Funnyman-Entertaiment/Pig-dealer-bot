import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { GetActiveEvents } from "../seasonalEvents/SeasonalEvents";

export const Events = new Command(
    "Events",
    "Tells you the rules and a description of the current event, if there is one going on.",
    false,
    false,
    new SlashCommandBuilder()
        .setName("events")
        .setDescription("Gives some information about the events that are currently going on, if any."),

    async (interaction) => {
        const activeEvents = GetActiveEvents();

        if(activeEvents.length === 0){
            const noEventsEmbed = new EmbedBuilder()
                .setTitle("There are no events going on!")
                .setDescription("What a bummer...")
                .setColor(Colors.DarkVividPink);

            interaction.reply({
                embeds: [noEventsEmbed]
            });

            return;
        }

        const eventsEmbed = new EmbedBuilder()
            .setTitle("There are some events going on!")
            .setColor(Colors.DarkVividPink);

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
    }
);