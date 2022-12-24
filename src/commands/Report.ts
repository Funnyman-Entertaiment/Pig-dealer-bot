import { Client, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildTextBasedChannel, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { Command } from "../Command";
import { GetAuthor } from "../Utils/GetAuthor";

export const Report = new Command(
    new SlashCommandBuilder()
    .setName("report")
    .addStringOption(new SlashCommandStringOption()
        .setName("content")
        .setDescription("content of the report")
        .setRequired(true))
    .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"),

    async (client: Client, interaction: CommandInteraction) => {
        const devServer = await client.guilds.fetch("1040735505127579718");
        const reportChannel = (await devServer.channels.fetch("1056247295571665018")) as GuildTextBasedChannel;

        const options = interaction.options as CommandInteractionOptionResolver
        const content = options.getString("content");

        const reportEmbed = new EmbedBuilder()
            .setAuthor(GetAuthor(interaction))
            .setTitle(`New report from ${interaction.user.username}`)
            .setDescription(content)
            .setColor(Colors.Orange);

        reportChannel.send({
            embeds: [reportEmbed]
        });

        const successEmbed = new EmbedBuilder()
            .setTitle(`Report sent successfully!`)
            .setColor(Colors.Green);

        interaction.followUp({
            ephemeral: true,
            embeds: [successEmbed]
        });
    }
);