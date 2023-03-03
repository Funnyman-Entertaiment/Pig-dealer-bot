import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";

export const Sex = new Command(
    "Ping",
    "Pings the bot to see if it's online.",
    false,
    false,
    new SlashCommandBuilder()
    .setName("ping")
    .setDescription("pong"),

    async (interaction: CommandInteraction) => {
        const content = `Hello ${interaction.user.username}!`;
        
        await interaction.reply({
            ephemeral: true,
            content
        });
    }
);