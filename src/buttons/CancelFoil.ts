import { EmbedBuilder, Colors } from "discord.js";
import { Button } from "../Button";
import { PigFoilMessage, RemoveMessageInfoFromCache } from "../database/MessageInfo";

export const CancelFoil = new Button(
	"CancelFoil",
	false,
	true,
	true,
	async (interaction, _serverInfo, messageInfo, userInfo) => {
		if(messageInfo === undefined){ return; }
		if(userInfo === undefined){ return; }

		const user = interaction.user;
		const message = interaction.message;

		const msgInfo = messageInfo as PigFoilMessage;
		if(msgInfo === undefined){ return; }

		RemoveMessageInfoFromCache(msgInfo);

		const notEnoughPigsEmbed = new EmbedBuilder()
			.setTitle("This foil crafting has been cancelled")
			.setAuthor({
				name: user.username,
				iconURL: user.avatarURL() ?? user.defaultAvatarURL
			})
			.setColor(Colors.DarkRed);

		message.edit({
			embeds: [notEnoughPigsEmbed],
			components: []
		});

		interaction.deferUpdate();
	}
);