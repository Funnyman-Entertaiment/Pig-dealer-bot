import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, ChannelType, Colors, PermissionFlagsBits, GuildChannel, Guild } from "discord.js";
import { AddServerInfoToCache, SaveAllServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";
import { LogInfo, PrintChannel, PrintServer, PrintUser } from "../Utils/Log";

export const SetAnnouncementChannel = new Command(
    "Set Announcement Channel",
    "Only available to users with administrative access to the server. Defines what channel the bot will send announcements to. By default it is the same one as the one it drops packs in.",
    false,
    false,
    new SlashCommandBuilder()
        .setName("setannouncementchannel")
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('channel to send announcements')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDescription("Let's you choose what channel the bot sends announcements to")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async (interaction, serverInfo) => {
        if(serverInfo === undefined){ return; }
        const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel', true)

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

        LogInfo(`User ${PrintUser(interaction.user)} is setting the annoucement channel to ${PrintChannel(channel as any as GuildChannel)} in server ${PrintServer(interaction.guild as any as Guild)}`);

        serverInfo.AnnouncementChannel = channel.id;

        await AddServerInfoToCache(serverInfo);

        SaveAllServerInfo();

        const successEmbed = new EmbedBuilder()
            .setTitle(`Announcements channel succesfully set to ${channel.name}`)
            .setColor(Colors.Green);

        await interaction.reply({
            ephemeral: true,
            embeds: [successEmbed],
        });
    }
);