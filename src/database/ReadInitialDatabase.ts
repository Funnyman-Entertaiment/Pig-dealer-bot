import { query, collection, getDocs } from "firebase/firestore/lite";
import { db } from "src/Bot";
import { AddPig, CreatePigFromData } from "./Pigs";
import { AddPack, CreatePackFromData } from "./Packs";

async function ReadPigs(){
    const pigQuery = query(collection(db, "pigs"));
    const pigs = await getDocs(pigQuery);

    pigs.forEach(pig => {
        const pigObject = CreatePigFromData(pig.id, pig.data());
        AddPig(pigObject);
    });
}

async function ReadPacks(){
    const packQuery = query(collection(db, "packs"));
    const packs = await getDocs(packQuery);

    packs.forEach(pack => {
        const packData = CreatePackFromData(pack.id, pack.data());
        AddPack(packData);
    });
}

export function ReadPigsAndPacks(){
    ReadPigs();

    ReadPacks();
}