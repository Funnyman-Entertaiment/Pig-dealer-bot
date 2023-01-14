import { Guild } from "discord.js";
import { client } from "../Bot";
import { AddServerInfoToCache, GetServerInfo, SaveAllServerInfo, ServerInfo } from "../database/ServerInfo";

export default () => {
    client.on("guildDelete", async (server: Guild) => {
        const serverInfo = await GetServerInfo(server.id) ?? new ServerInfo(
            server.id,
            undefined,
            undefined,
            undefined,
            false,
            [],
            true
        );

        serverInfo.Enabled = server.available;

        AddServerInfoToCache(serverInfo);
        SaveAllServerInfo();
    });
};