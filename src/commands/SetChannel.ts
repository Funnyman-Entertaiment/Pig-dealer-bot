import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, ChannelType, Colors, PermissionFlagsBits, GuildChannel } from "discord.js";
import { AddServerInfoToCache, CreateNewDefaultServerInfo, SaveAllServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";
import { LogInfo, PrintUser, PrintChannel, PrintServer } from "../Utils/Log";

export const SetBotChannel = new Command(
	"Set Channel",
	"Only available to users with administrative access to the server. It will define what channel the bot sends packs to.",
	false,
	false,
	new SlashCommandBuilder()
		.setName("setchannel")
		.addChannelOption(option =>
			option.setName("channel")
				.setDescription("channel to send packs")
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true))
		.setDescription("Let's you choose what channel the bot sends packs to")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),

	async (interaction, serverInfo) => {
		const server = interaction.guild;

		if (server === null) {
			const errorEmbed = new EmbedBuilder()
				.setTitle("There was an error fetching the server id.")
				.setColor(Colors.Red);

			await interaction.reply({
				ephemeral: true,
				embeds: [errorEmbed]
			});

			return;
		}

		if (serverInfo === undefined) {
			serverInfo = CreateNewDefaultServerInfo(server.id);
		}

		const channel = (interaction.options as CommandInteractionOptionResolver).getChannel("channel", true);

		LogInfo(`User ${PrintUser(interaction.user)} is setting the dropping channel to ${PrintChannel(channel as unknown as GuildChannel)} in server ${PrintServer(server)}`);

		serverInfo.Channel = channel.id;

		await AddServerInfoToCache(serverInfo);

		SaveAllServerInfo();

		const successEmbed = new EmbedBuilder()
			.setTitle(`Channel succesfully set to ${channel.name}`)
			.setColor(Colors.Green);

		await interaction.reply({
			ephemeral: true,
			embeds: [successEmbed],
		});
	}
);