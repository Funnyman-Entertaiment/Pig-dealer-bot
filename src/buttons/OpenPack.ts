import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from "discord.js";
import { collection, doc, DocumentData, Firestore, getDoc, getDocs, query, QueryDocumentSnapshot, QuerySnapshot, setDoc, where } from "firebase/firestore/lite";
import { Button } from "../Button";
import fs from 'fs';


const RARITIES_PER_PIG_COUNT: { readonly [key: number]: string[][]} = {
    [3]: [
        ["Common"],
        ["Rare"],
        ["Rare", "Epic"]
    ],
    [4]: [
        ["Common"],
        ["Rare"],
        ["Rare", "Epic"],
        ["Rare", "Epic", "Legendary"]
    ],
    [5]: [
        ["Common"],
        ["Common", "Rare"],
        ["Rare"],
        ["Rare", "Epic"],
        ["Rare", "Epic", "Legendary"]
    ],
    [6]: [
        ["Common"],
        ["Common", "Rare"],
        ["Rare"],
        ["Rare", "Epic"],
        ["Rare", "Epic"],
        ["Rare", "Epic", "Legendary"]
    ],
    [8]: [
        ["Common"],
        ["Common"],
        ["Common", "Rare"],
        ["Rare"],
        ["Rare", "Epic"],
        ["Rare", "Epic"],
        ["Rare", "Epic"],
        ["Rare", "Epic", "Legendary"]
    ]
}


function GetAuthor(interaction: Interaction){
    if(interaction.user === null){
        return null;
    }

    const user = interaction.user;
    const username = user.username;
    const avatar = user.avatarURL();
    
    return {name: username, iconURL: avatar === null? "" : avatar}
}


async function GetAvailablePigsFromPack(db: Firestore, msgInfoData: DocumentData){
    let pigs: QuerySnapshot;

    if((msgInfoData.Set as string).length !== 0){
        const packQuery = query(collection(db, "pigs"), where("Set", "==", msgInfoData.Set));
        pigs = await getDocs(packQuery);
    }else if((msgInfoData.Tags as string[]).length !== 0){
        const packQuery = query(collection(db, "pigs"), where("Tags", "array-contains-any", msgInfoData.Tags));
        pigs = await getDocs(packQuery);
    }else{
        const packQuery = query(collection(db, "pigs"));
        pigs = await getDocs(packQuery);
    }

    const pigsPerRarity: { [key: string]: QueryDocumentSnapshot[] } = {
        Common: [],
        Rare: [],
        Epic: [],
        Legendary: [],
    }

    for (const key in pigsPerRarity) {
        const list: QueryDocumentSnapshot[] = pigsPerRarity[key];

        pigs.forEach(pig => {
            if(pig.data().Rarity === key){
                list.push(pig);
            }
        });
    }

    return pigsPerRarity;
}


function ChoosePigs(availablePigs: { [key: string]: QueryDocumentSnapshot[] }, pigRarities: string[][]){
    const chosenPigs: QueryDocumentSnapshot[] = [];

    pigRarities.forEach(rarities => {
        const rarity = rarities[Math.floor(Math.random()*rarities.length)];

        const pigsOfRarity = availablePigs[rarity];

        chosenPigs.push(pigsOfRarity[Math.floor(Math.random()*pigsOfRarity.length)]);
    });

    return chosenPigs;
}


export const OpenPack = new Button("OpenPack",
    async (_, interaction, db) => {
        const server = interaction.guild;
        if(server === null) { return; }
        const message = interaction.message;

        const msgDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);
        const msgInfo = await getDoc(msgDoc);

        if(!msgInfo.exists() || msgInfo.data().Type !== "RandomPack"){ return; }

        const msgInfoData = msgInfo.data();

        const availablePigs = await GetAvailablePigsFromPack(db, msgInfoData);
        const pigRarities: string[][] = RARITIES_PER_PIG_COUNT[msgInfoData.PigCount];

        const chosenPigs = ChoosePigs(availablePigs, pigRarities);

        let img = `${chosenPigs[0].id}.png`;
        if((chosenPigs[0].data().Tags as string[]).includes("gif")){
            img = `${chosenPigs[0].id}.gif`;
        }

        if(!fs.existsSync(`./img/pigs/${img}`)){
            img = `none.png`;
        }

        const openedPackEmbed = new EmbedBuilder()
            .setTitle(`You've opened a ${msgInfoData.Name}`)
            .setDescription(chosenPigs.map(pig => pig.data().Name).join(", "))
            .addFields({
                name: chosenPigs[0].data().Name,
                value: chosenPigs[0].data().Description.length > 0? chosenPigs[0].data().Description : "..."
            })
            .setImage(`attachment://${img}`);

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('OpenedPackLeft')
                .setLabel('Left')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('OpenedPackRight')
                .setLabel('Right')
                .setStyle(ButtonStyle.Primary)
        );

        const author = GetAuthor(interaction);
        if(author !== null){
            openedPackEmbed.setAuthor(author);
        }

        await interaction.followUp({
            ephemeral: true,
            embeds: [openedPackEmbed],
            components: [row],
            files: [`./img/pigs/${img}`]
        }).then(message => {
            const messageDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);

            setDoc(messageDoc, {
                Type: "OpenedPackGallery",
                Pigs: chosenPigs.map(pig => pig.id),
                CurrentPig: 0,
                User: interaction.user.id
            });
        });
    }
);