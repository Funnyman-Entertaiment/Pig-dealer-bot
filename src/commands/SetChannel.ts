import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, ChannelType, Colors } from "discord.js";
import { doc, setDoc } from "firebase/firestore/lite";
import { Command } from "../Command";

export const SetBotChannel = new Command(
    new SlashCommandBuilder()
        .setName("setchannel")
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('channel to send packs')
                .setRequired(true))
        .setDescription("Let's you choose what channel the bot sends packs to"),

    async (_, interaction, db) => {
        const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel')

        if (channel === null) {
            return;
        }

        if (channel.type !== ChannelType.GuildText) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("Channel must be a text channel.")
                .setColor(Colors.Red);

            await interaction.followUp({
                ephemeral: true,
                embeds: [errorEmbed]
            });

            return
        }

        if (interaction.guildId === null) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("There was an error fetching the server id.")
                .setColor(Colors.Red);

            await interaction.followUp({
                ephemeral: true,
                embeds: [errorEmbed]
            });

            return;
        }

        const docRef = doc(db, "serverInfo", interaction.guildId)
        await setDoc(docRef, {
            Channel: channel.id
        });

        const successEmbed = new EmbedBuilder()
            .setTitle(`Channel succesfully set to ${channel.name}`)
            .setColor(Colors.Green)

        await interaction.followUp({
            ephemeral: true,
            embeds: [successEmbed],
        });
    }
);