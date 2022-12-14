import { collection, doc, DocumentData, Firestore, getDoc, getDocs, query, where } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";

type PigRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Assembly" | "One of a kind"


export class Pig extends DatabaseElement {
    Name: string;
    Description: string;
    Rarity: PigRarity;
    Set: string;
    Tags: string[];
    RequiredPigs: string[];

    constructor(id: string, name: string, description: string, rarity: PigRarity, set: string, tags: string[], requiredPigs: string[]) {
        super(id);

        this.Name = name;
        this.Description = description;
        this.Rarity = rarity;
        this.Set = set;
        this.Tags = tags;
        this.RequiredPigs = requiredPigs;
    }

    GetData(): object {
        return { 
            Name: this.Name,
            Description: this.Description,
            Rarity: this.Rarity,
            Set: this.Set,
            Tags: this.Tags,
            RequiredPigs: this.RequiredPigs
        }
    }
}


let CachedPigs: DatabaseElementList<Pig> | undefined;


function GetCachedPigs(){
    if(CachedPigs === undefined){
        CachedPigs = new DatabaseElementList<Pig>();
    }

    return CachedPigs;
}


export function CreatePigFromData(id: string, pigData: DocumentData): Pig{
    const newPig = new Pig(
        id,
        pigData.Name,
        pigData.Description,
        pigData.Rarity,
        pigData.Set,
        pigData.Tags,
        pigData.RequiredPigs
    )

    return newPig;
}


export async function AddPigToCache(pig: Pig, db: Firestore){
    await GetCachedPigs().Add(pig, db);
}


export async function AddPigsToCache(pigs: Pig[], db: Firestore){
    for (let i = 0; i < pigs.length; i++) {
        const pig = pigs[i];
        await AddPigToCache(pig, db);
    }
}


export async function GetPig(id: string, db: Firestore): Promise<Pig | undefined>{
    const cachedPig = GetCachedPigs().Get(id);

    if(cachedPig === undefined){
        const pigDocument = doc(db, `pigs/${id}`);
        const foundPig = await getDoc(pigDocument);

        if(foundPig.exists()){
            const pigData = foundPig.data();
            const newPig = CreatePigFromData(id, pigData);
            GetCachedPigs().Add(newPig, db);

            return newPig;
        }else{
            return undefined;
        }
    }else{
        return cachedPig;
    }
}


export async function GetPigsBySet(set: string, db:Firestore): Promise<Pig[]>{
    const pigsQuery = query(collection(db, "pigs"), where("Set", "==", set));
    const pigDocs = await getDocs(pigsQuery);
    const pigs: Pig[] = [];

    pigDocs.forEach(pigDoc => {
        const pigData = pigDoc.data();
        const newPig = CreatePigFromData(pigDoc.id, pigData);
        pigs.push(newPig);
    });

    return pigs;
}


export async function GetPigsWithTag(tag: string, db:Firestore): Promise<Pig[]>{
    const pigsQuery = query(collection(db, "pigs"), where("Tags", "array-contains-any", tag));
    const pigDocs = await getDocs(pigsQuery);
    const pigs: Pig[] = [];

    pigDocs.forEach(pigDoc => {
        const pigData = pigDoc.data();
        const newPig = CreatePigFromData(pigDoc.id, pigData);      
        pigs.push(newPig);
    });

    return pigs;
}


export async function GetAllPigs(db: Firestore): Promise<Pig[]>{
    const pigsQuery = query(collection(db, "pigs"));
    const pigDocs = await getDocs(pigsQuery);
    const pigs: Pig[] = [];

    pigDocs.forEach(pigDoc => {
        const pigData = pigDoc.data();
        const newPig = CreatePigFromData(pigDoc.id, pigData);  
        pigs.push(newPig);
    });

    return pigs;
}