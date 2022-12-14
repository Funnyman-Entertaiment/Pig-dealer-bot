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


let CachedPacks: DatabaseElementList<Pack> | undefined;


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


export async function GetPack(id: string, db: Firestore): Promise<Pack | undefined>{
    const cachedPack = GetCachedPacks().Get(id);

    if(cachedPack === undefined){
        const packDocument = doc(db, `packs/${id}`);
        const foundPack = await getDoc(packDocument);

        if(foundPack.exists()){
            const packData = foundPack.data();
            const newPack = CreatePackFromData(id, packData);
            GetCachedPacks().Add(newPack, db);

            return newPack;
        }else{
            return undefined;
        }
    }else{
        return cachedPack;
    }
}


export async function GetPacksByRarity(rarity: PackRarity, db:Firestore): Promise<Pack[]>{
    const packsQuery = query(collection(db, "packs"), where("Rarity", "==", rarity));
    const packDocs = await getDocs(packsQuery);
    const packs: Pack[] = [];

    packDocs.forEach(packDoc => {
        const packData = packDoc.data();
        const newPack = CreatePackFromData(packDoc.id, packData);      
        packs.push(newPack);
    });

    return packs;
}