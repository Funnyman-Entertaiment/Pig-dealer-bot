import { Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildTextBasedChannel, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { Command } from "../Command";
import { GetAuthor } from "../Utils/GetAuthor";
import { DevSpace } from "../Constants/Variables";

export const Report = new Command(
    new SlashCommandBuilder()
    .setName("report")
    .addStringOption(new SlashCommandStringOption()
        .setName("content")
        .setDescription("content of the report")
        .setRequired(true))
    .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"),

    async (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver
        const content = options.getString("content");

        const reportEmbed = new EmbedBuilder()
            .setAuthor(GetAuthor(interaction))
            .setTitle(`New report from ${interaction.user.username}`)
            .setDescription(content)
            .setColor(Colors.Orange);

        DevSpace.ReportChannel.send({
            embeds: [reportEmbed]
        });

        const successEmbed = new EmbedBuilder()
            .setTitle(`Report sent successfully!`)
            .setColor(Colors.Green);

        interaction.reply({
            ephemeral: true,
            embeds: [successEmbed]
        });
    }
);