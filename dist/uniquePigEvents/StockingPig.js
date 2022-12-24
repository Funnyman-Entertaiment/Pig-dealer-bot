"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockingPigEvent = void 0;
const Bot_1 = require("../Bot");
const DropPack_1 = require("../Utils/DropPack");
const Packs_1 = require("../database/Packs");
const ServerInfo_1 = require("../database/ServerInfo");
const UniquePigEvent_1 = require("./UniquePigEvent");
exports.StockingPigEvent = new UniquePigEvent_1.UniquePigEvent("306", async function (interaction) {
    const server = interaction.guild;
    const channel = interaction.channel;
    const pack = (0, Packs_1.GetPack)("16");
    if (pack !== undefined && channel !== null && server !== null) {
        const serverInfo = await (0, ServerInfo_1.GetServerInfo)(server.id, Bot_1.db);
        (0, DropPack_1.DropPack)(`${interaction.user.username} found a stocking!`, pack, channel, server, serverInfo, interaction.user.id, false);
    }
});
