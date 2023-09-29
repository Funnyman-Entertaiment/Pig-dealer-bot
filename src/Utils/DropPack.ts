import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, roleMention } from "discord.js";
import { client } from "../Bot";
import { COLOR_PER_PACK_RARITY } from "../Constants/ColorPerPackRarity";
import { Pack } from "../database/Packs";
import { AddServerInfoToCache, SaveAllServerInfo, ServerInfo } from "../database/ServerInfo";
import { RandomPackMessage, AddMessageInfoToCache } from "../database/MessageInfo";
import { LogInfo, LogWarn, PrintServer } from "./Log";
import { TrySendAutoRemoveMessage, TrySendMessageToChannel } from "./SendMessage";


export interface PackDropOptions {
	pack: Pack,
	title: string,
	userId?: string,
	ping?: boolean,
	ignoreCooldown?: boolean
}

export async function DropPack(serverInfo: ServerInfo, options: PackDropOptions) {
	if (!serverInfo.Enabled) { return; }

	let server: Guild | undefined = undefined;
	try {
		server = await client.guilds.fetch(serverInfo.ID);
	} catch {
		LogWarn(`Missing access to server ${serverInfo.ID}. Disabling server.`);
		serverInfo.Enabled = false;
		await AddServerInfoToCache(serverInfo);
		SaveAllServerInfo();
	}

	if (server === undefined) {
		return;
	}

	if (serverInfo.Channel === undefined) {
		LogWarn(`Can't send pack to server ${PrintServer(server)} because it doesn't have a set channel`);
		return;
	}

	const pack = options.pack;

	const img = `${pack.ID}.png`;

	const packEmbed = new EmbedBuilder()
		.setTitle(options.title)
		.setImage(`attachment://${img}`)
		.setColor(COLOR_PER_PACK_RARITY[pack.Rarity]);

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("OpenPack")
				.setLabel("Open!")
				.setStyle(ButtonStyle.Primary),
		);

	LogInfo(`Sending ${pack.Name} to server with id: ${PrintServer(server)}`);

	if (serverInfo.Role !== undefined && (options.ping !== undefined && options.ping)) {
		TrySendAutoRemoveMessage(serverInfo.ID, serverInfo.Channel, {
			content: roleMention(serverInfo.Role)
		});
	}

	const msgPromise = TrySendMessageToChannel(serverInfo.ID, serverInfo.Channel, {
		embeds: [packEmbed],
		components: [row],
		files: [`./img/packs/${img}`]
	});

	if (msgPromise === undefined) { return; }

	msgPromise.then(message => {
		if (message === undefined) { return; }
		if (server === undefined) { return; }

		const newMessage = new RandomPackMessage(
			message.id,
			server.id,
			pack.ID,
			false,
			options.ignoreCooldown ?? false,
			options.userId
		);

		AddMessageInfoToCache(newMessage);
	});
}