"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bot_1 = require("../Bot");
const ServerInfo_1 = require("../database/ServerInfo");
exports.default = () => {
    Bot_1.client.on("guildCreate", async (server) => {
        const serverInfo = await (0, ServerInfo_1.GetServerInfo)(server.id) ?? new ServerInfo_1.ServerInfo(server.id, undefined, undefined, undefined, false, [], [], true);
        serverInfo.Enabled = true;
        (0, ServerInfo_1.AddServerInfoToCache)(serverInfo);
        (0, ServerInfo_1.SaveAllServerInfo)();
    });
};
