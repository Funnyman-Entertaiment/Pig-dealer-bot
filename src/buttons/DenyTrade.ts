import { PigTradeMessage, RemoveMessageInfoFromCache } from "../database/MessageInfo";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { EmbedBuilder } from "@discordjs/builders";
import { Colors } from "discord.js";

export const DenyTrade = new Button(
	"CancelTrade",
	false,
	true,
	false,
	async (interaction, _serverInfo, messageInfo) => {
		if (messageInfo === undefined) { return; }
		const message = interaction.message;
		const user = interaction.user;

		const msgInfo = messageInfo as PigTradeMessage;
		if (msgInfo === undefined) { return; }

		interaction.deferUpdate();

		RemoveMessageInfoFromCache(msgInfo);

		const embed = message.embeds[0];

		if (embed === undefined) {
			const errorEmbed = MakeErrorEmbed("Couldn't retreive the embed for this message!");
			interaction.followUp({
				embeds: [errorEmbed]
			});
		}

		const editedEmbed = new EmbedBuilder(embed.data)
			.setDescription(`The trade has been cancelled by ${user.username}`)
			.setColor(Colors.Red);

		message.edit({
			embeds: [editedEmbed],
			components: []
		});
	}
);