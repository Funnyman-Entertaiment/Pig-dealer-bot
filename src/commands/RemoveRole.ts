import { Colors, EmbedBuilder, GuildTextBasedChannel, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { MakeErrorEmbed } from "../Utils/Errors";
import { GetServerInfo } from "../database/ServerInfo";
import { LogError, LogWarn, PrintServer } from "../Utils/Log";

export const RemoveRole = new Command(
    "RemoveRole",
    "Takes away the pig collector role from you.",
    true,
    false,
    new SlashCommandBuilder()
        .setName("removerole")
        .setDescription("Remove the pig collector role from you in this server")
        .setDMPermission(false),

    async function(interaction){
        const server = interaction.guild;
        const channel = interaction.channel as GuildTextBasedChannel;
        const user = interaction.user;
        if(server === null){ return; }
        if(channel === null){ return; }

        const serverInfo = await GetServerInfo(server.id);

        if(serverInfo === undefined || serverInfo.Role === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("This server doesn't have a pig collector role set")
                .setDescription("Ask the server admins to use the `/setrole` command to select a role that will get pinged everytime a pack drops.")
                .setColor(Colors.Red);

            interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }

        const me = server.members.me;

        if(me === null){
            LogError(`Bot couldn't find its user in server ${PrintServer(server)}`);

            const errorEmbed = MakeErrorEmbed(
                `Couldn't find bot user in server`,
                `Server: ${server.id}`
            );

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });

            return;
        }

        const permissions = me.permissionsIn(channel)
        
        if(!permissions.has(PermissionFlagsBits.ManageRoles)){
            const errorEmbed = new EmbedBuilder()
                .setTitle(`The bot doesn't have enough persmissions to remove roles in this server`)
                .setDescription(`Ask the admins to give the bot permissions to manage roles`)
                .setColor(Colors.Red);

            interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }

        await interaction.deferReply();

        const roleID = serverInfo.Role;
        const member = await server.members.fetch(user.id);
        const role = await server.roles.fetch(roleID);

        if(role === null){
            LogWarn(`Pig collerctor role couldn't be found in server ${PrintServer(server)}`);

            const errorEmbed = new EmbedBuilder()
                .setTitle(`The role couldn't be found`)
                .setDescription(`Ask the admins to use the \`/setrole\` command again.`)
                .setColor(Colors.Red)

            interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        member.roles.remove(role);

        const successEmbed = new EmbedBuilder()
            .setTitle(`The pig collector role has been succesfully removed!`)
            .setColor(Colors.Green);

        interaction.followUp({
            embeds: [successEmbed]
        });
    }
);