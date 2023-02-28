import { Colors, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import { Command } from "../Command";
import { PIGS_PER_FOIL_RARITY } from "../Constants/PigsPerFoilRarity";

export const ChangeFoilRequirements = new Command(
    "",
    "",
    new SlashCommandBuilder()
        .setName("changefoilrequiredpigs")
        .addIntegerOption(new SlashCommandIntegerOption()
            .setName("newamount")
            .setDescription("New amount of required pigs.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("rarity")
            .setDescription("Rarity lol")
            .setChoices(
                {
                    name: "Common",
                    value: "Common"
                },
                {
                    name: "Rare",
                    value: "Rare"
                },
                {
                    name: "Epic",
                    value: "Epic"
                },
                {
                    name: "Legendary",
                    value: "Legendary"
                }
            )
            .setRequired(true))
        .setDescription("Changes the amount of required pigs for each foil.")
        .setDMPermission(false),

        async function (interaction) {
            const options = (interaction.options as CommandInteractionOptionResolver);
            const rarity = options.getString("rarity", true);
            const amount = options.getInteger("newamount", true);

            PIGS_PER_FOIL_RARITY[rarity] = amount;

            const successEmbed = new EmbedBuilder()
                .setTitle(`Required pigs for ${rarity} foils changed`)
                .setColor(Colors.Green);

            interaction.reply({
                embeds: [successEmbed]
            });
        }
);