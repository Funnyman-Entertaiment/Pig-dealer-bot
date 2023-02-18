import { EmbedBuilder } from "discord.js";
import fs from 'fs';
import { Pig } from "../database/Pigs";
import { COLOR_PER_PIG_RARITY } from "../Constants/ColorPerPigRarity";

export interface PigRenderOptions {
    pig: Pig,
    count?: number,
    new?: boolean,
    showId?: boolean,
    favourite?: boolean,
    shared?: boolean
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
    .setColor(COLOR_PER_PIG_RARITY[pig.Rarity]);

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
        const count = options.pigCounts[pig.ID]?? 1;
        let number = "";
        if(count !== 1){
            number = ` (${count})`;
        }

        const isFavourite = favouritePigs.includes(pig.ID);
        const isShared = sharedPigs.includes(pig.ID);
        const stickers = `${isFavourite? "⭐": ""} ${isShared? "✅" : ""}`.trim();

        return {
            name: `${pig.Name} #${pig.ID.padStart(3, "0")}${number}`,
            value: `${stickers}${stickers.length>0? "\n":""}_${pig.Rarity}_\n${pig.Description}`,
            inline: true
        };
    }));
}