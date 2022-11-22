import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from "discord.js";
import { addDoc, collection, doc, DocumentData, Firestore, getDoc, getDocs, query, QueryDocumentSnapshot, QuerySnapshot, setDoc, where } from "firebase/firestore/lite";
import { Button } from "../Button";
import { SPECIAL_RARITIES_PER_PACK } from "../Constants/SpecialRaritiesPerPack";
import { PIG_RARITY_ORDER } from "../Constants/PigRarityOrder";
import { RARITIES_PER_PIG_COUNT } from "../Constants/RaritiesPerPigCount";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";


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


function ChoosePigs(availablePigs: { [key: string]: QueryDocumentSnapshot[] }, pigRarities: string[][], msgInfoData: DocumentData){
    const chosenPigs: QueryDocumentSnapshot[] = [];

    pigRarities.forEach(rarities => {
        let rarity = rarities[0];

        let legendaryChance = 0.01;
        let epicChance = 0.1;
        let rareChance = 0.35;

        if(msgInfoData.Name === "🍀Lucky Pack🍀"){
            legendaryChance = 0.1;
            epicChance = 0.5;
            rareChance = 1;
        }else if(msgInfoData.Name === "🍀Super Lucky Pack🍀"){
            epicChance = 0.35;
        }

        if(rarities.includes("Legendary") && Math.random() < legendaryChance){
            rarity = "Legendary";
        }else if(rarities.includes("Epic") && Math.random() < epicChance){
            rarity = "Epic";
        }else if(rarities.includes("Rare") && Math.random() < rareChance){
            rarity = "Rare";
        }

        const pigsOfRarity = availablePigs[rarity];
        let chosenPig: QueryDocumentSnapshot;

        do{
            chosenPig = pigsOfRarity[Math.floor(Math.random()*pigsOfRarity.length)]
        }while(chosenPigs.includes(chosenPig))

        chosenPigs.push(chosenPig);
    });

    return chosenPigs;
}


export const OpenPack = new Button("OpenPack",
    async (_, interaction, db) => {
        await interaction.deferReply();

        const server = interaction.guild;
        if(server === null) { return; }
        const message = interaction.message;

        const msgDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);
        const msgInfo = await getDoc(msgDoc);

        if(!msgInfo.exists() || msgInfo.data().Type !== "RandomPack"){ return; }

        const msgInfoData = msgInfo.data();

        const availablePigs = await GetAvailablePigsFromPack(db, msgInfoData);
        let pigRarities: string[][] = SPECIAL_RARITIES_PER_PACK[msgInfoData.Name];
        if(pigRarities === undefined){
            pigRarities = RARITIES_PER_PIG_COUNT[msgInfoData.PigCount];
        }

        const chosenPigs = ChoosePigs(availablePigs, pigRarities, msgInfoData);

        chosenPigs.sort((a, b) => {
            const aOrder = PIG_RARITY_ORDER[a.data().Rarity];
            const bOrder = PIG_RARITY_ORDER[b.data().Rarity];

            return aOrder - bOrder;
        });

        const newPigs: string[] = []

        for (let i = 0; i < chosenPigs.length; i++) {
            const pig = chosenPigs[i];

            const pigsQuery = query(collection(db, `serverInfo/${server.id}/users/${interaction.user.id}/pigs`), where("PigId", "==", pig.id));
            const foundPigs = await getDocs(pigsQuery);

            if(foundPigs.empty){
                newPigs.push(pig.id);
            }

            const newPigCollection = collection(db, `serverInfo/${server.id}/users/${interaction.user.id}/pigs`)
            await addDoc(newPigCollection, {
                PigId: pig.id
            })
        }

        const openedPackEmbed = new EmbedBuilder()
            .setTitle(`You've opened a ${msgInfoData.Name}`)
            .setDescription(`1/${chosenPigs.length}`);

        const imgPath = AddPigRenderToEmbed(openedPackEmbed, chosenPigs[0], newPigs.includes(chosenPigs[0].id));

        if(imgPath === undefined){ return; }

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('GalleryPrevious')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('GalleryNext')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
        );

        const author = GetAuthor(interaction);
        if(author !== null){
            openedPackEmbed.setAuthor(author);
        }

        await interaction.followUp({
            embeds: [openedPackEmbed],
            components: [row],
            files: [imgPath]
        }).then(message => {
            const messageDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);

            setDoc(messageDoc, {
                Type: "PigGallery",
                Pigs: chosenPigs.map(pig => pig.id),
                NewPigs: newPigs,
                CurrentPig: 0,
                User: interaction.user.id
            });
        });
    }
);