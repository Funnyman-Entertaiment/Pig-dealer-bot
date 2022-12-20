import { Client, GuildTextBasedChannel } from "discord.js";
import { getDocs, query, collection, Firestore, where } from "firebase/firestore/lite"
import { CreatePackFromData, Pack } from "../database/Packs";
import { DropPack } from "../Utils/DropPack";
import { CreateServerInfoFromData } from "../database/ServerInfo";


async function SpawnRandomPack(client: Client, db: Firestore) {
    const q = query(collection(db, "serverInfo"));
    const servers = await getDocs(q);

    servers.forEach(async server => {
        if (server.data().Channel === undefined) { return; }

        try {
            await client.channels.fetch(server.data().Channel).then(async channel => {
                if (channel === null) { return; }

                const guild = await client.guilds.fetch(server.id);

                //Get Random pack
                let chosenRarity: string = "Default";

                if (Math.random() <= 0.08) {
                    const packChance = Math.random();

                    if (packChance <= 0.7) {
                        chosenRarity = "Common";
                    } else if (packChance <= 0.9) {
                        chosenRarity = "Rare"
                    } else {
                        chosenRarity = "Super Rare"
                    }
                }

                const packQuery = query(collection(db, "packs"), where("Rarity", "==", chosenRarity));
                const packs = await getDocs(packQuery);

                const possiblePacks: Pack[] = [];

                packs.forEach(pack => {
                    possiblePacks.push(CreatePackFromData(pack.id, pack.data()))
                });

                var pack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];

                const serverInfo = CreateServerInfoFromData(server.id, server.data())

                DropPack(`A ${pack.Name} HAS APPEARED!`, pack, channel as GuildTextBasedChannel, guild, serverInfo, undefined, true)
            });
        } catch (error) {
            console.log("THIS ERROR ISN'T REAL: " + error);
        }
    });
}


export const PackDropper = function (client: Client, db: Firestore) {
    setTimeout(async () => {
        SpawnRandomPack(client, db);
    }, 1000 * 5);

    setInterval(async () => {
        await SpawnRandomPack(client, db);
    }, 1000 * 60 * 20);
}