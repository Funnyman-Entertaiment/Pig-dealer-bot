import { Client, GuildTextBasedChannel } from "discord.js";
import { getDocs, query, collection, Firestore, where } from "firebase/firestore/lite"
import { GetPacksByRarity, Pack, PackRarity } from "../database/Packs";
import { DropPack } from "../Utils/DropPack";
import { CreateServerInfoFromData } from "../database/ServerInfo";
import { LogError, LogInfo, PrintServer } from "../Utils/Log";


async function SpawnRandomPack(client: Client, db: Firestore) {
    const q = query(collection(db, "serverInfo"));
    const servers = await getDocs(q);

    LogInfo("Sending random packs.");

    servers.forEach(async server => {
        if (server.data().Channel === undefined) { return; }

        try {
            await client.channels.fetch(server.data().Channel).then(async channel => {
                if (channel === null) { return; }

                const guild = await client.guilds.fetch(server.id);

                //Get Random pack
                let chosenRarity: PackRarity = "Default";

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

                const possiblePacks: Pack[] = GetPacksByRarity(chosenRarity);

                var pack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];

                const serverInfo = CreateServerInfoFromData(server.id, server.data());

                let embedTitle = `A ${pack.Name} HAS APPEARED!`;
                let vowelRegex = '^[aieouAIEOU].*';
                let matched = pack.Name.match(vowelRegex);
                if (matched) {
                    embedTitle = `AN ${pack.Name} HAS APPEARED!`;
                }

                DropPack(embedTitle, pack, channel as GuildTextBasedChannel, guild, serverInfo, undefined, true);
            });
        } catch (error) {
            LogError(`Bot doesn't have access to server ${server.id}`);
        }
    });

    console.log("\n");
}


export const PackDropper = function (client: Client, db: Firestore) {
    setTimeout(async () => {
        SpawnRandomPack(client, db);
    }, 1000 * 5);

    setInterval(async () => {
        await SpawnRandomPack(client, db);
    }, 1000 * 60 * 20);
}