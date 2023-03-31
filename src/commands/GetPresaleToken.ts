import { SlashCommandBuilder, EmbedBuilder, Colors } from "discord.js";
import { Command } from "../Command";

/*
    THIS TOKEN GENERATION IS NOT SECURE AT ALL.

    HOWEVER.

    IT'S STILL VERY RUDE TO LOOK AT HOW IT WORKS, SO DON'T OR WE'LL BAN YOU FROM THE BOT.
*/













































export const GetPresaleToken = new Command(
    "GetPresaleToken",
    "Gives you your unique token for the presale of Funky Pigs.",
    false,
    false,
    new SlashCommandBuilder()
        .setName("getpresaletoken")
        .setDescription("Gives you your unique token for the presale of Funky Pigs."),

    async (interaction) => {
        const userId = interaction.user.id;
        const uniqueToken = parseInt(userId) * 2;

        const eventsEmbed = new EmbedBuilder()
            .setTitle("Here is your unique token!")
            .setDescription(`${uniqueToken}`)
            .setColor(Colors.DarkVividPink);

        interaction.reply({
            embeds: [eventsEmbed],
            ephemeral: true
        });
    }
);