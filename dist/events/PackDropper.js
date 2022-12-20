"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackDropper = void 0;
const lite_1 = require("firebase/firestore/lite");
const Packs_1 = require("../database/Packs");
const DropPack_1 = require("../Utils/DropPack");
const ServerInfo_1 = require("../database/ServerInfo");
async function SpawnRandomPack(client, db) {
    const q = (0, lite_1.query)((0, lite_1.collection)(db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(q);
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
                const packQuery = (0, lite_1.query)((0, lite_1.collection)(db, "packs"), (0, lite_1.where)("Rarity", "==", chosenRarity));
                const packs = await (0, lite_1.getDocs)(packQuery);
                const possiblePacks = [];
                packs.forEach(pack => {
                    possiblePacks.push((0, Packs_1.CreatePackFromData)(pack.id, pack.data()));
                });
                var pack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];
                const serverInfo = (0, ServerInfo_1.CreateServerInfoFromData)(server.id, server.data());
                (0, DropPack_1.DropPack)(`A ${pack.Name} HAS APPEARED!`, pack, channel, guild, serverInfo, undefined, true);
            });
        }
        catch (error) {
            console.log("THIS ERROR ISN'T REAL: " + error);
        }
    });
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
