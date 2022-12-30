"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackDropper = void 0;
const lite_1 = require("firebase/firestore/lite");
const Packs_1 = require("../database/Packs");
const DropPack_1 = require("../Utils/DropPack");
const ServerInfo_1 = require("../database/ServerInfo");
const Log_1 = require("../Utils/Log");
async function SpawnRandomPack(client, db) {
    const q = (0, lite_1.query)((0, lite_1.collection)(db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(q);
    (0, Log_1.LogInfo)("Sending random packs.");
    servers.forEach(async (server) => {
        if (server.data().Channel === undefined) {
            return;
        }
        try {
            await client.channels.fetch(server.data().Channel).then(async (channel) => {
                if (channel === null) {
                    return;
                }
                const guild = await client.guilds.fetch(server.id);
                let chosenRarity = "Default";
                if (Math.random() <= 0.08) {
                    const packChance = Math.random();
                    if (packChance <= 0.7) {
                        chosenRarity = "Common";
                    }
                    else if (packChance <= 0.9) {
                        chosenRarity = "Rare";
                    }
                    else {
                        chosenRarity = "Super Rare";
                    }
                }
                const possiblePacks = (0, Packs_1.GetPacksByRarity)(chosenRarity);
                var pack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];
                const serverInfo = (0, ServerInfo_1.CreateServerInfoFromData)(server.id, server.data());
                let embedTitle = `A ${pack.Name} HAS APPEARED!`;
                let vowelRegex = '^[aieouAIEOU].*';
                let matched = pack.Name.match(vowelRegex);
                if (matched) {
                    embedTitle = `AN ${pack.Name} HAS APPEARED!`;
                }
                (0, DropPack_1.DropPack)(embedTitle, pack, channel, guild, serverInfo, undefined, true);
            });
        }
        catch (error) {
            (0, Log_1.LogError)(`Bot doesn't have access to server ${server.id}`);
        }
    });
    console.log("\n");
}
const PackDropper = function (client, db) {
    setTimeout(async () => {
        SpawnRandomPack(client, db);
    }, 1000 * 5);
    setInterval(async () => {
        await SpawnRandomPack(client, db);
    }, 1000 * 60 * 20);
};
exports.PackDropper = PackDropper;
