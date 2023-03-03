import { Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { PackDropper } from "../events/PackDropper";

export const ResetPackDropper = new Command(
    "",
    "",
    false,
    false,
    new SlashCommandBuilder()
    .setName("resetpackdrops")
    .setDescription("Resets pack drops. Only use if absolutely necessary or pack drops may duplicate."),

    async (interaction: CommandInteraction) => {
        PackDropper();

        const successEmbed = new EmbedBuilder()
            .setTitle("Succesfully reset pack dropping")
            .setColor(Colors.Green);

        interaction.reply({
            embeds: [successEmbed],
            ephemeral: true
        });
    }
)