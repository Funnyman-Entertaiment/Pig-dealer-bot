import { getDocs, query, collection } from "firebase/firestore/lite"
import { GetPack } from "../database/Packs";
import { DropPack } from "../Utils/DropPack";
import { CreateServerInfoFromData } from "../database/ServerInfo";
import { LogInfo } from "../Utils/Log";
import { db } from "../Bot";
import { Cooldowns } from "../Constants/Variables";
import { PACK_12, PACK_2, PACK_5 } from "../Constants/SignificantPackIDs";


let packsUntil5Pack = -1;
let packsUntil12Pack = -1;


function GetRandomNumber(max: number, exception?: number): number {
    if (exception === undefined) {
        return Math.floor(Math.random() * max);
    }

    let chosen = GetRandomNumber(max - 1);

    if (chosen >= exception) {
        return chosen + 1;
    } else {
        return chosen;
    }
}


async function SpawnRandomPack() {
    const q = query(collection(db, "serverInfo"));
    const servers = await getDocs(q);

    LogInfo("Sending random packs.");

    servers.forEach(async server => {
        let pack = GetPack(PACK_2);

        if (packsUntil5Pack === 0) {
            pack = GetPack(PACK_5);
        }

        if (packsUntil12Pack === 0) {
            pack = GetPack(PACK_12);
        }

        if (pack === undefined) { return; }

        const serverInfo = CreateServerInfoFromData(server.id, server.data());

        let embedTitle = `A ${pack.Name} HAS APPEARED!`;
        let vowelRegex = '^[aieouAIEOU].*';
        let matched = pack.Name.match(vowelRegex);
        if (matched) {
            embedTitle = `AN ${pack.Name} HAS APPEARED!`;
        }

        DropPack(serverInfo, {
            pack: pack,
            title: embedTitle,
            ping: true
        });
    });

    if (packsUntil5Pack >= 0) { packsUntil5Pack--; }
    if (packsUntil12Pack >= 0) { packsUntil12Pack--; }

    console.log("");

    setTimeout(() => {
        SpawnRandomPack();
    }, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_PACKS);
}


async function Set5PackSpawn() {
    const maxPackNum = Math.floor(Cooldowns.MINUTES_BETWEEN_5_PACKS / Cooldowns.MINUTES_BETWEEN_PACKS)
    
    if (maxPackNum <= 0) {
        return;
    }

    if (packsUntil12Pack >= 0 && packsUntil12Pack <= maxPackNum) {
        packsUntil5Pack = GetRandomNumber(maxPackNum, packsUntil12Pack);
    }else{
        packsUntil5Pack = GetRandomNumber(maxPackNum);
    }

    setTimeout(() => {
        Set5PackSpawn();
    }, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_5_PACKS);
}


async function Set12PackSpawn() {
    const maxPackNum = Math.floor(Cooldowns.MINUTES_BETWEEN_12_PACKS / Cooldowns.MINUTES_BETWEEN_PACKS)

    if (maxPackNum <= 0) {
        return;
    }

    if (packsUntil5Pack >= 0 && packsUntil5Pack <= maxPackNum) {
        packsUntil12Pack = GetRandomNumber(maxPackNum, packsUntil5Pack);
    }else{
        packsUntil12Pack = GetRandomNumber(maxPackNum, packsUntil5Pack);
    }

    setTimeout(() => {
        Set5PackSpawn();
    }, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_12_PACKS);
}


export const PackDropper = function () {
    setTimeout(async () => {
        SpawnRandomPack();
    }, 1000 * 5);

    Set5PackSpawn();

    Set12PackSpawn();
}