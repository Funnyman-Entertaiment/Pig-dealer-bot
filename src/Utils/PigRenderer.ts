import { EmbedBuilder } from "discord.js";
import fs from 'fs';
import { Pig } from "../database/Pigs";
import { COLOR_PER_PIG_RARITY } from "../Constants/ColorPerPigRarity";

export interface PigRenderOptions {
    pig: Pig,
    count?: number,
    new?: boolean,
    showId?: boolean,
    favourite?: boolean
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
        embedDescriptionLines.push(`#${pig.ID.padStart(3, "0")}`);
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
    pigCounts: {[key: string]: number}
}

export function AddPigListRenderToEmbed(embed: EmbedBuilder, options: PigListRenderOptions){
    embed.setFields([]);

    embed.addFields(options.pigs.map(pig => {
        const count = options.pigCounts[pig.ID]?? 1;
        let number = "";
        if(count !== 1){
            number = ` (${count})`;
        }

        return {
            name: `${pig.Name} #${pig.ID.padStart(3, "0")}${number}`,
            value: `_${pig.Rarity}_\n${pig.Description}`,
            inline: true
        };
    }));
}