import { DocumentData } from "firebase/firestore/lite";
import { DatabaseElement } from "./DatabaseElement";

export type PackRarity = "Default" | "Common" | "Rare" | "Super Rare"


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


export function AddPack(pack: Pack){
    Packs.push(pack);
}


export function ClearPacks(){
    Packs = [];
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


export function GetPackByName(name: string): Pack | undefined{
    return Packs.find(pack => {
        return pack.Name === name;
    });
}