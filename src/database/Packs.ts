import { collection, doc, DocumentData, Firestore, getDoc, getDocs, query, where } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";

type PackRarity = "Default" | "Common" | "Rare" | "Super Rare"


export class Pack extends DatabaseElement {
    Name: string;
    Rarity: PackRarity;
    PigCount: number;
    Set: string;
    Tags: string[];

    constructor(id: string, name: string, rarity: PackRarity, pigCount: number, set: string, tags: string[]) {
        super(id);

        this.Name = name;
        this.Rarity = rarity;
        this.PigCount = pigCount;
        this.Set = set;
        this.Tags = tags;
    }

    GetData(): object {
        return {
            Name: this.Name,
            Rarity: this.Rarity,
            PigCount: this.PigCount,
            Set: this.Set,
            Tags: this.Tags
        }
    }
}


let Packs: Pack[] = [];
let CachedPacks: DatabaseElementList<Pack> | undefined;


export function AddPack(pack: Pack){
    Packs.push(pack);
}


function GetCachedPacks(){
    if(CachedPacks === undefined){
        CachedPacks = new DatabaseElementList<Pack>();
    }

    return CachedPacks;
}


export function CreatePackFromData(id: string, packData: DocumentData): Pack{
    const newPack = new Pack(
        id,
        packData.Name,
        packData.Rarity,
        packData.PigCount,
        packData.Set,
        packData.Tags
    )

    return newPack;
}


export async function AddPackToCache(pack: Pack, db: Firestore){
    await GetCachedPacks().Add(pack, db);
}


export async function AddPacksToCache(packs: Pack[], db: Firestore){
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddPackToCache(pack, db);
    }
}


export function GetPack(id: string): Pack | undefined{
    return Packs.find(pack => {
        return pack.ID === id;
    });
}


export function GetPacksByRarity(rarity: PackRarity): Pack[]{
    return Packs.filter(pack => {
        return pack.Rarity === rarity;
    })
}