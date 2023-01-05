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
let packsUntil5Pack = -1;
let packsUntil12Pack = -1;
function GetRandomNumber(max, exception) {
    if (exception === undefined) {
        return Math.floor(Math.random() * max);
    }
    let chosen = GetRandomNumber(max - 1);
    if (chosen >= exception) {
        return chosen + 1;
    }
    else {
        return chosen;
    }
}
async function SpawnRandomPack() {
    const q = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(q);
    (0, Log_1.LogInfo)("Sending random packs.");
    servers.forEach(async (server) => {
        let pack = (0, Packs_1.GetPack)(SignificantPackIDs_1.PACK_2);
        if (packsUntil5Pack === 0) {
            pack = (0, Packs_1.GetPack)(SignificantPackIDs_1.PACK_5);
        }
        if (packsUntil12Pack === 0) {
            pack = (0, Packs_1.GetPack)(SignificantPackIDs_1.PACK_12);
        }
        if (pack === undefined) {
            return;
        }
        const serverInfo = (0, ServerInfo_1.CreateServerInfoFromData)(server.id, server.data());
        let embedTitle = `A ${pack.Name} HAS APPEARED!`;
        let vowelRegex = '^[aieouAIEOU].*';
        let matched = pack.Name.match(vowelRegex);
        if (matched) {
            embedTitle = `AN ${pack.Name} HAS APPEARED!`;
        }
        (0, DropPack_1.DropPack)(serverInfo, {
            pack: pack,
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
    console.log("");
    setTimeout(() => {
        SpawnRandomPack();
    }, 1000 * 60 * Variables_1.Cooldowns.MINUTES_BETWEEN_PACKS);
}
async function Set5PackSpawn() {
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
    setTimeout(() => {
        Set5PackSpawn();
    }, 1000 * 60 * Variables_1.Cooldowns.MINUTES_BETWEEN_5_PACKS);
}
async function Set12PackSpawn() {
    const maxPackNum = Math.floor(Variables_1.Cooldowns.MINUTES_BETWEEN_12_PACKS / Variables_1.Cooldowns.MINUTES_BETWEEN_PACKS);
    if (maxPackNum <= 0) {
        return;
    }
    if (packsUntil5Pack >= 0 && packsUntil5Pack <= maxPackNum) {
        packsUntil12Pack = GetRandomNumber(maxPackNum, packsUntil5Pack);
    }
    else {
        packsUntil12Pack = GetRandomNumber(maxPackNum, packsUntil5Pack);
    }
    setTimeout(() => {
        Set5PackSpawn();
    }, 1000 * 60 * Variables_1.Cooldowns.MINUTES_BETWEEN_12_PACKS);
}
const PackDropper = function () {
    setTimeout(async () => {
        SpawnRandomPack();
    }, 1000 * 5);
    Set5PackSpawn();
    Set12PackSpawn();
};
exports.PackDropper = PackDropper;
