import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, Embed, Guild, GuildChannel, Interaction, Message } from "discord.js";
import { Timestamp } from "firebase/firestore/lite";
import { Button } from "../Button";
import { SPECIAL_RARITIES_PER_PACK } from "../Constants/SpecialRaritiesPerPack";
import { PIG_RARITY_ORDER } from "../Constants/PigRarityOrder";
import { RARITIES_PER_PIG_COUNT } from "../Constants/RaritiesPerPigCount";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GOLDEN_PIG_CHANCE_PER_RARITY } from "../Constants/GoldenPigChancePerRarity";
import { MakeErrorEmbed } from "../Utils/Errors";
import { AddUserInfoToCache, CreateNewDefaultUserInfo, GetUserInfo, GetUserPigIDs, UserInfo } from "../database/UserInfo";
import { AddMessageInfoToCache, MessageInfo, PigGalleryMessage, RandomPackMessage } from "../database/MessageInfo";
import { GetAllPigs, GetPig, GetPigsBySet, GetPigsWithTag, Pig } from "../database/Pigs";
import { ServerInfo } from "../database/ServerInfo";
import { LogError, LogInfo, PrintChannel, PrintServer, PrintUser } from "../Utils/Log";
import { GetPack, GetPackByName, Pack } from "../database/Packs";
import { existsSync } from "fs";
import { GOLDEN_PIG } from "../Constants/SignificantPigIDs";
import { CheckAndSendAssemblyPigEmbeds } from "../Utils/AssemblyyPigs";
import { GetAuthor } from "../Utils/GetAuthor";
import { Cooldowns } from "../Constants/Variables";
import { RunPostAssembledPigs, RunPostPackOpened } from "../seasonalEvents/SeasonalEvents";
import { ChooseRandomElementFromList } from "../Utils/ExtraRandom";
import { EGG_PACK, PACK_2 } from "../Constants/SignificantPackIDs";

function GetEditedEmbed(embed: EmbedBuilder, pack: Pack) {
	const openedImg = `./img/packs/opened/${pack.ID}.png`;

	if (!existsSync(openedImg)) {
		return;
	}

	embed.setImage(`attachment://${pack.ID}.png`);

	return openedImg;
}

function CanUserOpenPack(interaction: ButtonInteraction, userInfo: UserInfo, msgInfo: RandomPackMessage) {
	if (msgInfo.User !== undefined && msgInfo.User !== userInfo.ID) {
		const notYourPackEmbed = new EmbedBuilder()
			.setTitle("This pack is not for you!")
			.setDescription("Wait for another pack to drop and open that one you greedy pig.")
			.setColor(Colors.Red);

		interaction.reply({
			embeds: [notYourPackEmbed],
			ephemeral: true
		});
		return false;
	}

	if (msgInfo.Opened) {
		const notYourPackEmbed = new EmbedBuilder()
			.setTitle("This pack has already been opened!")
			.setDescription("Give the message a moment to update and you'll see someone claimed it before you.")
			.setColor(Colors.Red);

		interaction.reply({
			embeds: [notYourPackEmbed],
			ephemeral: true
		});

		return false;
	}

	let lastTimeOpened = userInfo.LastTimeOpened;
	if (msgInfo.Pack === PACK_2) {
		lastTimeOpened = userInfo.LastTimeOpened2Pack;
	}
	const currentTime = Timestamp.now();

	if (
		lastTimeOpened !== undefined &&
		currentTime.seconds - lastTimeOpened.seconds <= 60 * Cooldowns.MINUTES_PACK_OPENING_CD &&
		!msgInfo.IgnoreCooldown
	) {
		const totalDiff = (60 * Cooldowns.MINUTES_PACK_OPENING_CD) - (currentTime.seconds - lastTimeOpened.seconds);
		const minutes = Math.floor(totalDiff / 60);
		const seconds = totalDiff % 60;

		const waitEmbed = new EmbedBuilder()
			.setColor(Colors.DarkRed)
			.setTitle(`You must wait for ${minutes}:${seconds.toString().padStart(2, "0")} minutes to open another pack`)
			.setAuthor(GetAuthor(interaction as unknown as CommandInteraction));

		interaction.reply({
			embeds: [waitEmbed],
			ephemeral: true,
			options: {
				ephemeral: true
			}
		});

		return false;
	}

	return true;
}

function SetUserCooldown(msgInfo: RandomPackMessage, userInfo: UserInfo, server: Guild, interaction: ButtonInteraction) {
	if (msgInfo.IgnoreCooldown) { return; }

	if (msgInfo.Pack === PACK_2) {
		userInfo.LastTimeOpened2Pack = Timestamp.now();
	} else {
		userInfo.LastTimeOpened = Timestamp.now();
	}

	if (server.memberCount > 5) { return; }

	const warningEmbed = new EmbedBuilder()
		.setTitle("This server is too small (Less than 5 members)")
		.setDescription(`To avoid cheating, the bot will give you an extended cooldown. ${userInfo.WarnedAboutCooldown ? "" : "\nSince this is your first time, you won't be penalized."}`)
		.setColor(Colors.DarkOrange);

	interaction.followUp({
		embeds: [warningEmbed],
	});

	if (userInfo.WarnedAboutCooldown) {
		const longTime = Timestamp.fromMillis(Timestamp.now().toMillis() + 1000 * 60 * 60 * 96);
		userInfo.LastTimeOpened2Pack = longTime;
		userInfo.LastTimeOpened = longTime;
	}

	userInfo.WarnedAboutCooldown = true;
}

function EditEmbedWithOpenedPack(message: Message, pack: Pack, embed: Embed) {
	const editedEmbed = new EmbedBuilder(embed.data);
	const openedImg = GetEditedEmbed(editedEmbed, pack);

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("OpenPack")
				.setLabel("Open!")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true),
		);

	if (openedImg === undefined) {
		message.edit({
			components: [row]
		});
	} else {
		message.edit({
			embeds: [editedEmbed],
			components: [row],
			files: [openedImg],
		});
	}
}

function GetAvailablePigsFromPack(pack: Pack) {
	let pigs: Pig[];

	if (pack.Set.length !== 0) {
		pigs = GetPigsBySet(pack.Set);
	} else if ((pack.Tags as string[]).length !== 0) {
		pigs = GetPigsWithTag(pack.Tags);
	} else {
		pigs = GetAllPigs();
	}

	const pigsPerRarity: { [key: string]: Pig[] } = {};

	pigs.forEach(pig => {
		if (pigsPerRarity[pig.Rarity] === undefined) {
			pigsPerRarity[pig.Rarity] = [];
		}

		const pigsOfRarity = pigsPerRarity[pig.Rarity];
		pigsOfRarity.push(pig);
	});

	return pigsPerRarity;
}

function GetPigRaritiesFromPack(pack: Pack) {
	if (SPECIAL_RARITIES_PER_PACK[pack.Name] === undefined) {
		return RARITIES_PER_PIG_COUNT[pack.PigCount];
	}

	return SPECIAL_RARITIES_PER_PACK[pack.Name];
}

function GetRandomRarityFromWeightedList(rarities: { readonly [key: string]: number }) {
	let rarity = "";

	for (const possibleRarity in rarities) {
		const chance = rarities[possibleRarity];

		if (Math.random() > chance) {
			break;
		}

		rarity = possibleRarity;
	}

	return rarity;
}

function ChoosePigs(serverInfo: ServerInfo, pack: Pack) {
	const availablePigsForPack = GetAvailablePigsFromPack(pack);
	const pigRaritiesForPack = GetPigRaritiesFromPack(pack);

	let allowGoldenPig: boolean = !serverInfo.HasSpawnedGoldenPig;

	const chosenPigs: Pig[] = [];

	pigRaritiesForPack.forEach(async rarities => {
		const rarity: string = GetRandomRarityFromWeightedList(rarities);

		const pigsOfRarity = availablePigsForPack[rarity];
		let chosenPig: Pig;

		do {
			chosenPig = ChooseRandomElementFromList(pigsOfRarity);
		} while (chosenPigs.includes(chosenPig));

		const goldenPigChance = GOLDEN_PIG_CHANCE_PER_RARITY[rarity] ?? 0;

		if (Math.random() <= goldenPigChance && allowGoldenPig) {
			const goldenPig = GetPig(GOLDEN_PIG);
			if (goldenPig !== undefined) {
				chosenPigs.push(goldenPig);
				allowGoldenPig = false;
			}
		} else {
			chosenPigs.push(chosenPig);
		}
	});

	serverInfo.HasSpawnedGoldenPig = !allowGoldenPig;

	chosenPigs.sort((a, b) => {
		const aOrder = PIG_RARITY_ORDER[a.Rarity];
		const bOrder = PIG_RARITY_ORDER[b.Rarity];

		return aOrder - bOrder;
	});

	return chosenPigs;
}

function GetOpenPackFollowUp(packName: string, chosenPigs: Pig[], newPigs: string[], interaction: Interaction, userInfo: UserInfo) {
	const openedPackEmbed = new EmbedBuilder()
		.setTitle(`You've opened a ${packName}`)
		.setDescription(`1/${chosenPigs.length}`);

	const imgPath = AddPigRenderToEmbed(openedPackEmbed, {
		pig: chosenPigs[0],
		new: newPigs.includes(chosenPigs[0].ID),
		count: 1,
		favourite: userInfo.FavouritePigs.includes(chosenPigs[0].ID),
		showSet: true
	});

	if (imgPath === undefined) { return; }

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("GalleryPrevious")
				.setLabel("Previous")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId("GalleryNext")
				.setLabel("Next")
				.setStyle(ButtonStyle.Primary)
		);

	if (!userInfo.FavouritePigs.includes(chosenPigs[0].ID)) {
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

	const author = GetAuthor(interaction as unknown as CommandInteraction);
	if (author !== null) {
		openedPackEmbed.setAuthor(author);
	}

	return {
		embeds: [openedPackEmbed],
		components: [row],
		files: [imgPath]
	};
}

function SendOpenPackFollowUp(userInfo: UserInfo, chosenPigs: Pig[], pigsToShowInPack: Pig[], pack: Pack, serverId: string, interaction: ButtonInteraction) {
	const userPigs = GetUserPigIDs(userInfo);

	const newPigs = chosenPigs.filter(pig => !userPigs.includes(pig.ID)).map(pig => pig.ID);

	const packFollowUp = GetOpenPackFollowUp(pack.Name, pigsToShowInPack, newPigs, interaction, userInfo);

	if (packFollowUp === undefined) {
		return;
	}

	interaction.followUp(packFollowUp).then(message => {
		if (message === null) { return; }

		const newMsgInfo = new PigGalleryMessage(
			message.id,
			serverId,
			0,
			{},
			pigsToShowInPack.map(pig => pig.ID),
			newPigs,
			[],
			userInfo.FavouritePigs,
			[],
			true,
			true,
			interaction.user.id
		);
		AddMessageInfoToCache(newMsgInfo);
	});
}

function AddPigsToUser(chosenPigs: Pig[], userInfo: UserInfo) {
	chosenPigs.forEach(pig => {
		const count = userInfo.Pigs[pig.ID];

		if (count === undefined) {
			userInfo.Pigs[pig.ID] = 1;
		} else {
			userInfo.Pigs[pig.ID] = count + 1;
		}
	});
}

function CheckSpoiledEgg(msgInfo: MessageInfo, pack: Pack): boolean {
	if (pack.ID !== EGG_PACK) { return false; }

	const currentTime = Timestamp.now();
	const elapsedTime = currentTime.seconds - msgInfo.TimeSent.seconds;

	return elapsedTime >= 60 * 11;
}

function OpenSpoledEgg(message: Message, embed: Embed, interaction: ButtonInteraction) {
	const editedEmbed = new EmbedBuilder(embed.data);

	const openedImg = "./img/packs/opened/spoiled.png";

	if (!existsSync(openedImg)) {
		return;
	}

	editedEmbed.setImage("attachment://spoiled.png");

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("OpenPack")
				.setLabel("Open!")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true),
		);

	if (openedImg === undefined) {
		message.edit({
			components: [row]
		});
	} else {
		message.edit({
			embeds: [editedEmbed],
			components: [row],
			files: [openedImg],
		});
	}

	const spoiledEmbed = new EmbedBuilder()
		.setTitle("The egg has spoiled!")
		.setDescription("Sucks to be you...")
		.setAuthor(GetAuthor(interaction as unknown as CommandInteraction))
		.setColor(Colors.Red)
		.setImage("attachment://spoiledegg.png");

	interaction.followUp({
		embeds: [spoiledEmbed],
		files: ["./img/special/spoiledegg.png"]
	});
}

function GetEasterStagePack(msgInfo: MessageInfo, pack: Pack): Pack {
	if (pack.ID !== EGG_PACK) { return pack; }

	const currentTime = Timestamp.now();
	const elapsedTime = currentTime.seconds - msgInfo.TimeSent.seconds;
	const elapsedMinutes = Math.max(1, Math.floor(elapsedTime / 60));

	const newPack = GetPackByName(`Egg Stage ${elapsedMinutes}`) ?? pack;

	return newPack;
}

export const OpenPack = new Button(
	"OpenPack",
	true,
	true,
	false,
	async (interaction, serverInfo, messageInfo) => {
		if (serverInfo === undefined) { return; }
		if (messageInfo === undefined) { return; }

		if (interaction.guild === null) {
			return;
		}

		const server = interaction.guild;
		const user = interaction.user;
		const message = interaction.message;

		const serverID = server.id;
		const userID = user.id;

		const userInfo = await GetUserInfo(userID) ?? CreateNewDefaultUserInfo(userID);
		AddUserInfoToCache(userInfo);
		const msgInfo = messageInfo as RandomPackMessage;
		if (msgInfo === undefined) { return; }

		if (msgInfo.BeingOpenedBy !== undefined) {
			const errorEmbed = new EmbedBuilder()
				.setTitle("This pack is already being opened")
				.setDescription("Someone is already trying to open this pack.\nWait a moment to see if they could succesfully open it.")
				.setColor(Colors.Red);

			interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true
			});

			return;
		}

		msgInfo.BeingOpenedBy = user.id;

		let pack = GetPack(msgInfo.Pack);

		if (pack === undefined) {
			const errorEmbed = MakeErrorEmbed("Could't find pack for this message", `Pack Id: ${msgInfo.Pack}`);

			interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true,
			});

			return;
		}

		if (!CanUserOpenPack(interaction, userInfo, msgInfo)) {
			msgInfo.BeingOpenedBy = undefined;
			return;
		}

		await interaction.deferReply();

		msgInfo.Opened = true;
		SetUserCooldown(msgInfo, userInfo, server, interaction);

		const embed = message.embeds[0];

		if (embed === undefined) {
			LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as unknown as GuildChannel)} in server ${PrintServer(server)}`);
			const errorEmbed = MakeErrorEmbed("Couldn't get embed from message", "Make sure the bot is able to send embeds");
			interaction.followUp({
				ephemeral: true,
				embeds: [errorEmbed]
			});
			return;
		}

		if (CheckSpoiledEgg(msgInfo, pack)) {
			OpenSpoledEgg(message, embed, interaction);
			return;
		}

		EditEmbedWithOpenedPack(message, pack, embed);

		pack = GetEasterStagePack(msgInfo, pack);

		LogInfo(`User ${PrintUser(interaction.user)} opened ${pack.Name} pack in server ${PrintServer(server)}`);

		const chosenPigs = ChoosePigs(serverInfo, pack).filter(x => x !== undefined);
		const pigsToShowInPack = [...chosenPigs];

		RunPostPackOpened(pack, serverInfo, chosenPigs, pigsToShowInPack);

		SendOpenPackFollowUp(userInfo, chosenPigs, pigsToShowInPack, pack, serverID, interaction);

		AddPigsToUser(chosenPigs, userInfo);

		const assembledPigs = await CheckAndSendAssemblyPigEmbeds(serverID, userID, chosenPigs);

		if (assembledPigs === undefined) { return; }

		RunPostAssembledPigs(pack, serverInfo, assembledPigs);
	}
);
