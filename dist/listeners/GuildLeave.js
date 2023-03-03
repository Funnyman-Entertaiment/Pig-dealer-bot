"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bot_1 = require("../Bot");
const ServerInfo_1 = require("../database/ServerInfo");
exports.default = () => {
    Bot_1.client.on("guildDelete", async (server) => {
        const serverInfo = await (0, ServerInfo_1.GetServerInfo)(server.id);
        if (serverInfo === undefined) {
            return;
        }
        serverInfo.Enabled = server.available;
        (0, ServerInfo_1.AddServerInfoToCache)(serverInfo);
        (0, ServerInfo_1.SaveAllServerInfo)();
    });
};
