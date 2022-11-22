import { EmbedBuilder } from "discord.js";
import { DocumentSnapshot } from "firebase/firestore/lite";
import fs from 'fs';
import { COLOR_PER_PIG_RARITY } from "../Constants/ColorPerPigRarity";


export function AddPigRenderToEmbed(embed: EmbedBuilder, pig: DocumentSnapshot, isNew: boolean): string|undefined{
    const pigData = pig.data();

    if(pigData === undefined){ return; }

    let img = `${pig.id}.png`;
    if((pigData.Tags as string[]).includes("gif")){
        img = `${pig.id}.gif`;
    }

    if(!fs.existsSync(`./img/pigs/${img}`)){
        img = `none.png`;
    }

    const embedDescriptionLines: string[] = [];

    if(isNew){
        embedDescriptionLines.push("***NEW***");
    }

    embedDescriptionLines.push(`_${pigData.Rarity}_`);
    embedDescriptionLines.push(pigData.Description.length > 0? pigData.Description : "...");
    embedDescriptionLines.push(`#${pig.id.padStart(3, "0")}`);

    const embedDescription = embedDescriptionLines.join("\n");

    embed.setFields({
        name: pigData.Name,
        value: embedDescription
    })
    .setImage(`attachment://${img}`)
    .setColor(COLOR_PER_PIG_RARITY[pigData.Rarity]);

    return `./img/pigs/${img}`;
}