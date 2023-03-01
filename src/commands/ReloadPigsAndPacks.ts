import { Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { ClearPacks } from "../database/Packs";
import { ClearPigs } from "../database/Pigs";
import { ReadPigsAndPacks } from "../database/ReadInitialDatabase";

export const ReloadPigsPacks = new Command(
    "",
    "",
    false,
    false,
    new SlashCommandBuilder()
        .setName("reloadpigspacks")
        .setDescription("Reloads the pigs and the packs from the database"),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        ClearPigs();
        ClearPacks();

        ReadPigsAndPacks();
        
        const successEmbed = new EmbedBuilder()
            .setTitle("Pigs and packs reloaded succesfully")
            .setColor(Colors.Green);

        await interaction.followUp({
            embeds: [successEmbed]
        });
    }
);