import { SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { Command } from "../Command";

export const GetRole = new Command(
    new SlashCommandBuilder()
        .setName("foil")
        .addStringOption(new SlashCommandStringOption()
            .setName("set")
            .setDescription("Set to build the foil for.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("rarity")
            .setDescription("Rarity of the foil to build")
            .setRequired(true))
        .addBooleanOption(new SlashCommandBooleanOption()
            .setName("onlydupes")
            .setDescription("Whether to only use dupe pigs or not. Default is true."))
        .setDescription("Attempt to craft a foil pig for a set and rarity."),

    async function(interaction){
        const user = interaction.user;
    }
);