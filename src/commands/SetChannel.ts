import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, ChannelType, Colors, PermissionFlagsBits } from "discord.js";
import { doc, setDoc } from "firebase/firestore/lite";
import { AddServerInfoToCache, GetServerInfo, SaveAllServerInfo, ServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";
import { db } from "../Bot";

export const SetBotChannel = new Command(
    new SlashCommandBuilder()
        .setName("setchannel")
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('channel to send packs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDescription("Let's you choose what channel the bot sends packs to")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async (interaction) => {
        const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel')

        if (channel === null) {
            return;
        }

        if (channel.type !== ChannelType.GuildText) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("Channel must be a text channel.")
                .setColor(Colors.Red);

            await interaction.reply({
                ephemeral: true,
                embeds: [errorEmbed]
            });

            return;
        }

        if (interaction.guildId === null) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("There was an error fetching the server id.")
                .setColor(Colors.Red);

            await interaction.reply({
                ephemeral: true,
                embeds: [errorEmbed]
            });

            return;
        }

        let serverInfo = await GetServerInfo(interaction.guildId);

        if(serverInfo === undefined){
            serverInfo = new ServerInfo(
                interaction.guildId,
                channel.id,
                undefined,
                false,
                [],
                true
            );
        }else{
            serverInfo.Channel = channel.id;
        }

        await AddServerInfoToCache(serverInfo);

        SaveAllServerInfo();

        const successEmbed = new EmbedBuilder()
            .setTitle(`Channel succesfully set to ${channel.name}`)
            .setColor(Colors.Green)

        await interaction.reply({
            ephemeral: true,
            embeds: [successEmbed],
        });
    }
);