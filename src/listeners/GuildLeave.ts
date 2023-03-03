import { Guild } from "discord.js";
import { client } from "../Bot";
import { AddServerInfoToCache, GetServerInfo, SaveAllServerInfo } from "../database/ServerInfo";

export default () => {
    client.on("guildDelete", async (server: Guild) => {
        const serverInfo = await GetServerInfo(server.id)

        if(serverInfo === undefined){ return; }

        serverInfo.Enabled = server.available;

        AddServerInfoToCache(serverInfo);
        SaveAllServerInfo();
    });
};