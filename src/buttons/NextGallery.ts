import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildChannel } from "discord.js";
import { PigGalleryMessage } from "../database/MessageInfo";
import { GetPig } from "../database/Pigs";
import { MakeErrorEmbed } from "../Utils/Errors";
import { Button } from "../Button";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { DoesPigIdHaveUniqueEvent, TriggerUniquePigEvent } from "../uniquePigEvents/UniquePigEvents";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";


export const NextGallery = new Button(
	"GalleryNext",
	false,
	true,
	false,
	async (interaction, _serverInfo, messageInfo) => {
		if (messageInfo === undefined) { return; }
		await interaction.deferUpdate();

		const server = interaction.guild;
		if (server === null) { return; }

		const message = interaction.message;
		const msgInfo = messageInfo as PigGalleryMessage;


		if (msgInfo === undefined) { return; }

		if (msgInfo.CurrentPig == msgInfo.Pigs.length - 1) { return; }

		const pigToLoad = msgInfo.Pigs[msgInfo.CurrentPig + 1];

		msgInfo.CurrentPig++;

		if (message.embeds[0] === undefined) {
			LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as unknown as GuildChannel)} in server ${PrintServer(server)}`);
			const errorEmbed = MakeErrorEmbed("Couldn't get embed from message", "Make sure the bot is able to send embeds");
			interaction.followUp({
				embeds: [errorEmbed]
			});
			return;
		}

		const editedEmbed = new EmbedBuilder(message.embeds[0].data)
			.setDescription(`${msgInfo.CurrentPig + 1}/${msgInfo.Pigs.length}`);

		const pig = GetPig(pigToLoad);

		if (pig === undefined) {
			const errorEmbed = MakeErrorEmbed(
				"Couldn't fetch pig",
				`Server: ${server.id}`,
				`Message: ${message.id}`,
				`Pig to Load: ${pigToLoad}`
			);

			await interaction.followUp({
				embeds: [errorEmbed]
			});

			return;
		}

		const imgPath = AddPigRenderToEmbed(editedEmbed, {
			pig: pig,
			new: msgInfo.NewPigs.includes(pig.ID),
			showId: !DoesPigIdHaveUniqueEvent(pigToLoad),
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
					.setDisabled(msgInfo.Pigs.length === 1),
				new ButtonBuilder()
					.setCustomId("GalleryNext")
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(msgInfo.CurrentPig == msgInfo.Pigs.length - 1)
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

		if (!msgInfo.SeenPigs.includes(msgInfo.CurrentPig)) {
			msgInfo.SeenPigs.push(msgInfo.CurrentPig);
			TriggerUniquePigEvent(pigToLoad, interaction);
		}
	}
);