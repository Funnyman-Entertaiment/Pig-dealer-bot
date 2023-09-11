import { FoilChecksMessage } from "../database/MessageInfo";
import { Button } from "../Button";
import { EmbedBuilder, GuildChannel } from "discord.js";
import { MakeErrorEmbed } from "../Utils/Errors";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";
import { AddFoilChecksToEmbed } from "../Utils/PigRenderer";

export const NextFoilCheck = new Button(
	"NextFoilCheck",
	false,
	true,
	true,
	async (interaction, _serverInfo, messageInfo) => {
		if (messageInfo === undefined) { return; }

		await interaction.deferUpdate();

		const server = interaction.guild;
		if (server === null) { return; }
		const message = interaction.message;
		const msgInfo = messageInfo as FoilChecksMessage;
		if (msgInfo === undefined) { return; }

		let newPage = msgInfo.CurrentPage + 1;
		let setsNum = 0;

		setsNum += Object.keys(msgInfo.PigAmountsPerSet).length;

		const newFirstSet = newPage * 6 + 1;
		if (newFirstSet > setsNum) {
			newPage = 0;
		}

		msgInfo.CurrentPage = newPage;

		if (message.embeds[0] === undefined) {
			LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as unknown as GuildChannel)} in server ${PrintServer(server)}`);
			const errorEmbed = MakeErrorEmbed("Couldn't get embed from message", "Make sure the bot is able to send embeds");
			await interaction.followUp({
				embeds: [errorEmbed]
			});
			return;
		}

		const editedEmbed = new EmbedBuilder(message.embeds[0].data)
			.setFields([]);

		AddFoilChecksToEmbed(editedEmbed, {
			page: msgInfo.CurrentPage,
			pigAmountsPerSet: msgInfo.PigAmountsPerSet
		});

		message.edit({
			embeds: [editedEmbed]
		});
	}
);