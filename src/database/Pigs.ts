import { DocumentData } from "firebase/firestore/lite";
import { DatabaseElement } from "./DatabaseElement";

type PigRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Assembly" | "One of a kind" | "Christmas" | "Postcard" | "Postcard (Animated)"


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


let Pigs: Pig[] = [];


export function AddPig(pig: Pig){
    Pigs.push(pig);
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


export function GetPig(id: string): Pig | undefined{
    return Pigs.find(pig => {
        return pig.ID == id;
    });
}


export function GetAllPigs(): Pig[]{
    return [...Pigs];
}


export function GetPigsBySet(set: string): Pig[]{
    return Pigs.filter(pig => {
        return pig.Set === set;
    });
}


export function GetPigsWithTag(tags: string[]): Pig[]{
    return Pigs.filter(pig => {
        let hasAllTags = true;
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            if(!pig.Tags.includes(tag)){
                hasAllTags = false;
            }
        }
        return hasAllTags;
    });
}


export function GetPigsByRarity(rarity: string): Pig[]{
    return Pigs.filter(pig =>{
        return pig.Rarity === rarity;
    });
}