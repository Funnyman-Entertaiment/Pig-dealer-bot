import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";

export const Announcement = new Command(
    new SlashCommandBuilder()
        .setName("announcement")
        .addSubcommand(subcommand =>
            subcommand
                .setName("new")
                .setDescription("Creates a new announcement")
                .addStringOption(option =>
                    option
                        .setName("title")
                        .setDescription("The title the announcement embed will have"))
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("The description the announcement embed will have")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("addField")
                .setDescription("Adds a new field")
                .addStringOption(option =>
                    option
                        .setName("title")
                        .setDescription("The title the new field will have"))
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("The description the new field will have")))
        .setDescription("Manages everything about announcements"),

    async (_client: Client, interaction: CommandInteraction) => {
        const content = `I'm not having sex with you right now ${interaction.user.username}.`;

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
)