import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, CommandInteractionOptionResolver, Colors, EmbedBuilder } from "discord.js";
import { Command } from "src/Command";
import { GetServerInfo, AddServerInfoToCache, SaveAllServerInfo, ServerInfo } from "src/database/ServerInfo";

export const SetSafeMode = new Command(
    "SetSafeMode",
    "Sets the safe mode for this server.",
    false,
    false,
    new SlashCommandBuilder()
        .setName("setsafemode")
        .addBooleanOption(option =>
            option.setName('safe')
                .setDescription('Whether to set safe mode or not')
                .setRequired(true))
        .setDescription("Let's you choose if safe mode is active for this server")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

        async (interaction) => {
            const safeMode = (interaction.options as CommandInteractionOptionResolver).getBoolean('safe', true);
    
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
    
            if (serverInfo === undefined) {
                serverInfo = new ServerInfo(
                    interaction.guildId,
                    undefined,
                    undefined,
                    undefined,
                    false,
                    [],
                    [],
                    safeMode,
                    true
                )
            } else {
                serverInfo.SafeMode = safeMode;
            }
    
            await AddServerInfoToCache(serverInfo);
    
            SaveAllServerInfo()
    
            const successEmbed = new EmbedBuilder()
                .setTitle(`Safe mode succesfully ${safeMode?"enabled":"disabled"}`)
                .setColor(Colors.Green);
    
            await interaction.reply({
                ephemeral: true,
                embeds: [successEmbed],
            });
        }
);