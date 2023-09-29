import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors, PermissionFlagsBits } from "discord.js";
import { AddServerInfoToCache, CreateNewDefaultServerInfo, SaveAllServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";
import { LogInfo, PrintUser, PrintServer } from "../Utils/Log";

export const SetBotRole = new Command(
	"Set Role",
	"Only available to users with administrative access to the server. It will define what role the bot pings when a new pack drops, or when an announcement is made.",
	true,
	false,
	new SlashCommandBuilder()
		.setName("setrole")
		.addRoleOption(option =>
			option.setName("role")
				.setDescription("role that will get pinged when the bot drops a pack")
				.setRequired(true))
		.setDescription("Let's you choose what role the bot pings")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),

	async (interaction, serverInfo) => {
		const server = interaction.guild;

		if(server === null){
			const errorEmbed = new EmbedBuilder()
				.setTitle("There was an error fetching the server id.")
				.setColor(Colors.Red);

			await interaction.reply({
				ephemeral: true,
				embeds: [errorEmbed]
			});

			return;
		}

		if(serverInfo === undefined){
			serverInfo = CreateNewDefaultServerInfo(server.id);
		}

		const role = (interaction.options as CommandInteractionOptionResolver).getRole("role", true);

		LogInfo(`User ${PrintUser(interaction.user)} is setting the dropping channel to ${role.name} in server ${PrintServer(server)}`);

		serverInfo.Role = role.id;

		await AddServerInfoToCache(serverInfo);

		SaveAllServerInfo();

		const successEmbed = new EmbedBuilder()
			.setTitle(`Role succesfully set to @${role.name}`)
			.setColor(Colors.Green);

		await interaction.reply({
			ephemeral: true,
			embeds: [successEmbed],
		});
	}
);