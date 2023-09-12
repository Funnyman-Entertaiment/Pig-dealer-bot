"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackDropper = void 0;
const lite_1 = require("firebase/firestore/lite");
const Packs_1 = require("../database/Packs");
const DropPack_1 = require("../Utils/DropPack");
const ServerInfo_1 = require("../database/ServerInfo");
const Log_1 = require("../Utils/Log");
const Bot_1 = require("../Bot");
const Variables_1 = require("../Constants/Variables");
const SignificantPackIDs_1 = require("../Constants/SignificantPackIDs");
const SeasonalEvents_1 = require("../seasonalEvents/SeasonalEvents");
let packsUntil5Pack = -1;
let packsUntil12Pack = -1;
let packDropperTimeout;
let fivePackTimeout;
let twelvePackTimeout;
function GetRandomNumber(max, exception) {
    if (exception === undefined) {
        return Math.floor(Math.random() * max);
    }
    const chosen = GetRandomNumber(max - 1);
    if (chosen >= exception) {
        return chosen + 1;
    }
    else {
        return chosen;
    }
}
async function SpawnRandomPack() {
    if (packDropperTimeout !== undefined) {
        clearTimeout(packDropperTimeout);
    }
    packDropperTimeout = setTimeout(() => {
        SpawnRandomPack();
    }, 1000 * 60 * Variables_1.Cooldowns.MINUTES_BETWEEN_PACKS);
    const q = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(q);
    (0, Log_1.LogInfo)("Sending random packs.");
    let pack = (0, Packs_1.GetPack)(SignificantPackIDs_1.PACK_2);
    if (packsUntil5Pack === 0) {
        pack = (0, Packs_1.GetPack)(SignificantPackIDs_1.PACK_5);
    }
    if (packsUntil12Pack === 0) {
        pack = (0, Packs_1.GetPack)(SignificantPackIDs_1.PACK_12);
    }
    servers.forEach(async (server) => {
        if (pack === undefined) {
            return;
        }
        const serverInfo = (0, ServerInfo_1.CreateServerInfoFromData)(server.id, server.data());
        if (!serverInfo.Enabled) {
            return;
        }
        let packToDropInServer = pack;
        const returnedPack = (0, SeasonalEvents_1.RunPostChooseRandomPack)(pack, serverInfo);
        if (returnedPack !== undefined) {
            packToDropInServer = returnedPack;
        }
        let embedTitle = `A ${packToDropInServer.Name} HAS APPEARED!`;
        const vowelRegex = "^[aieouAIEOU].*";
        const matched = packToDropInServer.Name.match(vowelRegex);
        if (matched) {
            embedTitle = `AN ${packToDropInServer.Name} HAS APPEARED!`;
        }
        (0, DropPack_1.DropPack)(serverInfo, {
            pack: packToDropInServer,
            title: embedTitle,
            ping: true
        });
    });
    if (packsUntil5Pack >= 0) {
        packsUntil5Pack--;
    }
    if (packsUntil12Pack >= 0) {
        packsUntil12Pack--;
    }
}
async function Set5PackSpawn() {
    if (fivePackTimeout !== undefined) {
        clearTimeout(fivePackTimeout);
    }
    const maxPackNum = Math.floor(Variables_1.Cooldowns.MINUTES_BETWEEN_5_PACKS / Variables_1.Cooldowns.MINUTES_BETWEEN_PACKS);
    if (maxPackNum <= 0) {
        return;
    }
    if (packsUntil12Pack >= 0 && packsUntil12Pack <= maxPackNum) {
        packsUntil5Pack = GetRandomNumber(maxPackNum, packsUntil12Pack);
    }
    else {
        packsUntil5Pack = GetRandomNumber(maxPackNum);
    }
    fivePackTimeout = setTimeout(() => {
        Set5PackSpawn();
    }, 1000 * 60 * Variables_1.Cooldowns.MINUTES_BETWEEN_5_PACKS);
}
async function Set12PackSpawn() {
    if (twelvePackTimeout !== undefined) {
        clearTimeout(twelvePackTimeout);
    }
    const maxPackNum = Math.floor(Variables_1.Cooldowns.MINUTES_BETWEEN_12_PACKS / Variables_1.Cooldowns.MINUTES_BETWEEN_PACKS);
    if (maxPackNum <= 0) {
        return;
    }
    packsUntil12Pack = GetRandomNumber(maxPackNum, packsUntil5Pack);
    twelvePackTimeout = setTimeout(() => {
        Set12PackSpawn();
    }, 1000 * 60 * Variables_1.Cooldowns.MINUTES_BETWEEN_12_PACKS);
}
const PackDropper = function () {
    packDropperTimeout = setTimeout(() => {
        SpawnRandomPack();
    }, 1000 * 5);
    setInterval(() => {
        if (!packDropperTimeout) {
            SpawnRandomPack();
        }
    }, 1000 * 60 * 60 * 2);
    Set5PackSpawn();
    Set12PackSpawn();
};
exports.PackDropper = PackDropper;
