import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors, PermissionFlagsBits } from "discord.js";
import { AddServerInfoToCache, SaveAllServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";

export const SetBotRole = new Command(
    "Set Role",
    "Only available to users with administrative access to the server. It will define what role the bot pings when a new pack drops, or when an announcement is made.",
    true,
    false,
    new SlashCommandBuilder()
        .setName("setrole")
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('role that will get pinged when the bot drops a pack')
                .setRequired(true))
        .setDescription("Let's you choose what role the bot pings")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async (interaction, serverInfo) => {
        if(serverInfo === undefined){ return; }
        const role = (interaction.options as CommandInteractionOptionResolver).getRole('role', true)

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

        serverInfo.Role = role.id;

        await AddServerInfoToCache(serverInfo);

        SaveAllServerInfo()

        const successEmbed = new EmbedBuilder()
            .setTitle(`Role succesfully set to @${role.name}`)
            .setColor(Colors.Green);

        await interaction.reply({
            ephemeral: true,
            embeds: [successEmbed],
        });
    }
);