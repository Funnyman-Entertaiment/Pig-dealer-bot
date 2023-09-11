import { Guild } from "discord.js";
import { client } from "../Bot";
import { AddServerInfoToCache, CreateNewDefaultServerInfo, GetServerInfo, SaveAllServerInfo } from "../database/ServerInfo";

export default () => {
	client.on("guildCreate", async (server: Guild) => {
		const serverInfo = await GetServerInfo(server.id) ?? CreateNewDefaultServerInfo(server.id);

		serverInfo.Enabled = true;

		AddServerInfoToCache(serverInfo);
		SaveAllServerInfo();
	});
};