import { Colors, EmbedBuilder, GuildTextBasedChannel, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { MakeErrorEmbed } from "../Utils/Errors";
import { GetServerInfo } from "../database/ServerInfo";
import { LogError, LogInfo, LogWarn, PrintServer, PrintUser } from "../Utils/Log";

export const GetRole = new Command(
    new SlashCommandBuilder()
        .setName("getrole")
        .setDescription("Assigns you the pig collector role in this server")
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
                .setTitle(`The bot doesn't have enough persmissions to add roles in this server`)
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

        LogInfo(`Added pig collector role to user ${PrintUser(member.user)}`);

        member.roles.add(role);

        const successEmbed = new EmbedBuilder()
            .setTitle(`You've been given the pig collector role succesfully!`)
            .setColor(Colors.Green);

        interaction.followUp({
            embeds: [successEmbed]
        });
    }
);