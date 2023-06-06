import { EmbedBuilder } from "discord.js";
import fs from 'fs';
import { GetPig, Pig } from "../database/Pigs";
import { COLOR_PER_PIG_RARITY } from "../Constants/ColorPerPigRarity";
import { PIGS_PER_FOIL_RARITY } from "../Constants/PigsPerFoilRarity";

export interface PigRenderOptions {
    pig: Pig,
    count?: number,
    new?: boolean,
    showId?: boolean,
    favourite?: boolean,
    shared?: boolean,
    showSet?: boolean
}

export function AddPigRenderToEmbed(embed: EmbedBuilder, options: PigRenderOptions): string{
    const pig = options.pig;

    let img = `${pig.ID}.png`;
    if(pig.Tags.includes("gif")){
        img = `${pig.ID}.gif`;
    }
    
    if(!fs.existsSync(`./img/pigs/${img}`)){
        img = `none.png`;
    }

    const embedDescriptionLines: string[] = [];

    if(options.new !== undefined && options.new){
        embedDescriptionLines.push("***NEW***");
    }

    const rarityTag = pig.Tags.find(tag => tag.startsWith("[RARITY]"));
    if(rarityTag === undefined){
        embedDescriptionLines.push(`_${pig.Rarity}_`);
    }else{
        const showRarity = rarityTag.replace("[RARITY]", "").trim();
        embedDescriptionLines.push(`_${showRarity}_`);
    }

    if(options.showSet !== undefined && options.showSet) {
        let set = pig.Set;
        if(set === "-") {
            set = "Default";
        }
        embedDescriptionLines.push(`${set} set`);
    }

    embedDescriptionLines.push(pig.Description.length > 0? pig.Description : "...");

    if(options.showId === undefined || options.showId){
        embedDescriptionLines.push(`#${pig.ID.padStart(3, "0")}${options.favourite? " ⭐": ""}${options.shared? " ✅": ""}`);
    }

    const embedDescription = embedDescriptionLines.join("\n");

    const count = options.count?? 1;

    embed.setFields({
        name: `${pig.Name} ${count === 1? "" : `(${count})`}`,
        value: embedDescription
    })
    .setImage(`attachment://${img}`)
    .setColor(COLOR_PER_PIG_RARITY[pig.Rarity.replace(" (foil)", "")]);

    return `./img/pigs/${img}`;
}


export interface PigListRenderOptions {
    pigs: Pig[],
    pigCounts: {[key: string]: number},
    favouritePigs?: string[],
    sharedPigs?: string[]
}

export function AddPigListRenderToEmbed(embed: EmbedBuilder, options: PigListRenderOptions){
    const favouritePigs = options.favouritePigs?? [];
    const sharedPigs = options.sharedPigs?? [];

    embed.setFields([]);

    embed.addFields(options.pigs.map(pig => {
        const pigID = pig.ID;

        const count = options.pigCounts[pigID]?? 1;
        let number = "";
        if(count !== 1){
            number = ` (${count})`;
        }

        const isFavourite = favouritePigs.includes(pigID);
        const isShared = sharedPigs.includes(pigID);
        const stickers = `${isFavourite? "⭐": ""} ${isShared? "✅" : ""}`.trim();

        const rarityTag = pig.Tags.find(tag => tag.startsWith("[RARITY]"));
        let rarity = pig.Rarity as string;
        if(rarityTag !== undefined){
            const showRarity = rarityTag.replace("[RARITY]", "").trim();
            rarity = showRarity;
        }

        return {
            name: `${pig.Name} #${pigID.padStart(3, "0")}${number}`,
            value: `${stickers}${stickers.length>0? "\n":""}_${rarity}_\n${pig.Description}`,
            inline: true
        };
    }));
}


export interface FoilCheckRenderOptions {
    pigAmountsPerSet: {[key: string]: {[key: string]: number}},
    page: number
}
const FOILED_RARITIES = ["Common", "Rare", "Epic", "Legendary"];

export function AddFoilChecksToEmbed(embed: EmbedBuilder, options: FoilCheckRenderOptions): boolean{
    let currentSetNum = 0;

    const minSetNum = options.page * 6;
    const maxSetNum = (options.page + 1) * 6;

    const sets: string[] = []
    for (const set in options.pigAmountsPerSet) {
        sets.push(set);
    }
    sets.sort();

    sets.forEach(set => {
        if(currentSetNum < minSetNum){
            currentSetNum++;
            return;
        }else if(currentSetNum >= maxSetNum){
            return;
        }

        currentSetNum++;

        const pigAmountsPerRarity = options.pigAmountsPerSet[set];
        let fieldDescription = "";

        FOILED_RARITIES.forEach(rarity => {
            const amount = pigAmountsPerRarity[rarity] ?? 0;
            const targetAmount = PIGS_PER_FOIL_RARITY[rarity];

            if(targetAmount > 0) {
                fieldDescription += `${rarity} ${amount}/${targetAmount} ${amount < targetAmount? "":"✅"}\n`
            }
        });

        embed.addFields({
            name: set === "-" ? "Default" : set,
            value: fieldDescription,
            inline: true
        });
    });

    return currentSetNum >= maxSetNum;
}