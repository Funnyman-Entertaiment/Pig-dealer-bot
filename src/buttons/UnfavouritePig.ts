import { EmbedBuilder, GuildChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { PigGalleryMessage } from "../database/MessageInfo";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GetPig } from "../database/Pigs";
import { DoesPigIdHaveUniqueEvent } from "../uniquePigEvents/UniquePigEvents";

export const UnfavouritePig = new Button(
	"UnfavouritePig",
	false,
	true,
	true,
	async function (interaction, _serverInfo, messageInfo, userInfo) {
		if (messageInfo === undefined) { return; }
		if (userInfo === undefined) { return; }
		await interaction.deferUpdate();

		const server = interaction.guild;
		if (server === null) { return; }

		const message = interaction.message;
		const msgInfo = messageInfo as PigGalleryMessage;
		if (msgInfo === undefined) { return; }

		const currentPigID = msgInfo.Pigs[msgInfo.CurrentPig];

		if (msgInfo.FavouritePigs.includes(currentPigID)) {
			const index = msgInfo.FavouritePigs.indexOf(currentPigID);
			msgInfo.FavouritePigs.splice(index, 1);
		}
		if (userInfo.FavouritePigs.includes(currentPigID)) {
			const index = userInfo.FavouritePigs.indexOf(currentPigID);
			userInfo.FavouritePigs.splice(index, 1);
		}

		if (message.embeds[0] === undefined) {
			LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as unknown as GuildChannel)} in server ${PrintServer(server)}`);
			const errorEmbed = MakeErrorEmbed("Couldn't get embed from message", "Make sure the bot is able to send embeds");
			interaction.followUp({
				embeds: [errorEmbed]
			});
			return;
		}

		const editedEmbed = new EmbedBuilder(message.embeds[0].data);

		const pig = GetPig(currentPigID);

		if (pig === undefined) {
			const errorEmbed = MakeErrorEmbed(
				"Couldn't fetch pig",
				`Server: ${server.id}`,
				`Message: ${message.id}`,
				`Pig to Load: ${currentPigID}`
			);

			await interaction.followUp({
				embeds: [errorEmbed]
			});

			return;
		}

		const imgPath = AddPigRenderToEmbed(editedEmbed, {
			pig: pig,
			new: msgInfo.NewPigs.includes(pig.ID),
			showId: !DoesPigIdHaveUniqueEvent(currentPigID),
			count: msgInfo.PigCounts[pig.ID],
			favourite: msgInfo.FavouritePigs.includes(pig.ID),
			shared: msgInfo.SharedPigs.includes(pig.ID),
			showSet: msgInfo.ShowSet
		});
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("GalleryPrevious")
					.setLabel("Previous")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(msgInfo.CurrentPig === 0),
				new ButtonBuilder()
					.setCustomId("GalleryNext")
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(msgInfo.CurrentPig === msgInfo.Pigs.length - 1)
			);

		if (msgInfo.ShowFavouriteButton) {
			if (!msgInfo.FavouritePigs.includes(pig.ID)) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId("FavouritePig")
						.setLabel("Favourite ⭐")
						.setStyle(ButtonStyle.Secondary)
				);
			} else {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId("UnfavouritePig")
						.setLabel("Unfavourite ⭐")
						.setStyle(ButtonStyle.Secondary)
				);
			}
		}

		await message.edit({
			embeds: [editedEmbed],
			files: [imgPath],
			components: [row]
		});
	}
);