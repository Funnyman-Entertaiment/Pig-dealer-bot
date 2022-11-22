import { Colors, EmbedBuilder, Message } from "discord.js";
import { doc, Firestore, getDoc } from "firebase/firestore/lite";
import fs from 'fs';

const COLOR_PER_PIG_RARITY: { readonly [key: string]: number } = {
    Common: Colors.LightGrey,
    Rare: Colors.Yellow,
    Epic: Colors.Purple,
    Legendary: Colors.LuminousVividPink,
    Assembly: Colors.Red
}

export async function RenderPig(message: Message, pigId: string, db: Firestore){
    const pigDoc = doc(db, `pigs/${pigId}`);
        const pig = await getDoc(pigDoc);
        const pigData = pig.data();

        if(pig === undefined || pigData === undefined){ return; }
        
        let img = `${pig.id}.png`;
        if((pigData.Tags as string[]).includes("gif")){
            img = `${pig.id}.gif`;
        }

        if(!fs.existsSync(`./img/pigs/${img}`)){
            img = `none.png`;
        }

        const editedEmbed = new EmbedBuilder(message.embeds[0].data)
            .setFields({
                name: pigData.Name,
                value: "[if new it goes there]\n" +
                `_${pigData.Rarity}_\n`+
                (pigData.Description.length > 0? pigData.Description : "...") + "\n" +
                `#${pigId.padStart(3, pigId)}`,
            })
            .setImage(`attachment://${img}`)
            .setColor(COLOR_PER_PIG_RARITY[pigData.Rarity]);

        await message.edit({
            embeds: [editedEmbed],
            files: [`./img/pigs/${img}`]
        })
}