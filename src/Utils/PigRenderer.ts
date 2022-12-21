import { EmbedBuilder } from "discord.js";
import fs from 'fs';
import { Pig } from "../database/Pigs";
import { COLOR_PER_PIG_RARITY } from "../Constants/ColorPerPigRarity";


export function AddPigRenderToEmbed(embed: EmbedBuilder, pig: Pig, isNew: boolean): string{
    let img = `${pig.ID}.png`;
    if(pig.Tags.includes("gif")){
        img = `${pig.ID}.gif`;
    }

    if(!fs.existsSync(`./img/pigs/${img}`)){
        img = `none.png`;
    }

    const embedDescriptionLines: string[] = [];

    if(isNew){
        embedDescriptionLines.push("***NEW***");
    }

    embedDescriptionLines.push(`_${pig.Rarity}_`);
    embedDescriptionLines.push(pig.Description.length > 0? pig.Description : "...");
    embedDescriptionLines.push(`#${pig.ID.padStart(3, "0")}`);

    const embedDescription = embedDescriptionLines.join("\n");

    embed.setFields({
        name: pig.Name,
        value: embedDescription
    })
    .setImage(`attachment://${img}`)
    .setColor(COLOR_PER_PIG_RARITY[pig.Rarity]);

    return `./img/pigs/${img}`;
}