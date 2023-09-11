import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, GuildChannel } from "discord.js";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";
import { AddPigListRenderToEmbed } from "../Utils/PigRenderer";
import { PigListMessage } from "../database/MessageInfo";
import { GetPig, Pig } from "../database/Pigs";

export const NextList = new Button(
	"ListNext",
	false,
	true,
	false,
	async (interaction, _serverInfo, messageInfo) => {
		if (messageInfo === undefined) { return; }

		await interaction.deferUpdate();

		const server = interaction.guild;
		if (server === null) { return; }

		const message = interaction.message;
		const msgInfo = messageInfo as PigListMessage;
		if (msgInfo === undefined) { return; }

		if (message.embeds[0] === undefined) {
			LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as unknown as GuildChannel)} in server ${PrintServer(server)}`);
			const errorEmbed = MakeErrorEmbed("Couldn't get embed from message", "Make sure the bot is able to send embeds");
			interaction.followUp({
				embeds: [errorEmbed]
			});
			return;
		}

		msgInfo.CurrentPage++;

		const pigList = msgInfo.PigsBySet[msgInfo.CurrentSet];

		const pageStart = msgInfo.CurrentPage * 9;
		const pageEnd = Math.min(pigList.length, msgInfo.CurrentPage * 9 + 9);

		if (pageStart >= pigList.length) {
			msgInfo.CurrentPage--;
			return;
		}

		const editedEmbed = new EmbedBuilder(message.embeds[0].data);

		const firstPigsPage = pigList.slice(pageStart, pageEnd);
		AddPigListRenderToEmbed(editedEmbed, {
			pigs: firstPigsPage.map(id => GetPig(id)).filter(pig => pig !== undefined) as unknown as Pig[],
			pigCounts: msgInfo.PigCounts,
			sharedPigs: msgInfo.SharedPigs,
			favouritePigs: msgInfo.FavouritePigs
		});

		const originalRow = message.components[0];
		const newRow = new ActionRowBuilder<ButtonBuilder>(message.components[0].data);

		originalRow.components.forEach(component => {
			if (component.customId === "ListNext") {
				newRow.addComponents([
					new ButtonBuilder(component.data)
						.setDisabled(pageEnd === pigList.length)
				]);
			} else if (component.customId === "ListPrevious") {
				newRow.addComponents([
					new ButtonBuilder(component.data)
						.setDisabled(false)
				]);
			} else {
				newRow.addComponents([
					new ButtonBuilder(component.data)
				]);
			}
		});

		await message.edit({
			embeds: [editedEmbed],
			components: [newRow]
		});
	}
);