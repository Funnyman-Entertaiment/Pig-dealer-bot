import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors, PermissionFlagsBits } from "discord.js";
import { AddServerInfoToCache, GetServerInfo, SaveAllServerInfo, ServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";

export const SetBotRole = new Command(
    "SetRole",
    "Sets the role Pig Dealer will ping whenever a pack drops or a it sends a new announcement.",
    new SlashCommandBuilder()
        .setName("setrole")
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('role that will get pinged when the bot drops a pack')
                .setRequired(true))
        .setDescription("Let's you choose what role the bot pings")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async (interaction) => {
        const role = (interaction.options as CommandInteractionOptionResolver).getRole('role')

        if (role === null) {
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
                undefined,
                role.id,
                undefined,
                false,
                [],
                [],
                true
            );
        }else{
            serverInfo.Role = role.id;
        }

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