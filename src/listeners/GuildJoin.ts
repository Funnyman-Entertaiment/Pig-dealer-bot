import { Guild } from "discord.js";
import { client } from "../Bot";
import { AddServerInfoToCache, GetServerInfo, SaveAllServerInfo, ServerInfo } from "../database/ServerInfo";

export default () => {
    client.on("guildCreate", async (server: Guild) => {
        const serverInfo = await GetServerInfo(server.id) ?? new ServerInfo(
            server.id,
            undefined,
            undefined,
            undefined,
            false,
            [],
            [],
            true
        );

        serverInfo.Enabled = true;

        AddServerInfoToCache(serverInfo);
        SaveAllServerInfo();
    });
};