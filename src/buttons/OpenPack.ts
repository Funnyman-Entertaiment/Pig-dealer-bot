import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from "discord.js";
import { addDoc, collection, doc, DocumentData, Firestore, getDoc, getDocs, query, QueryDocumentSnapshot, QuerySnapshot, setDoc, updateDoc, where } from "firebase/firestore/lite";
import { Button } from "../Button";
import { SPECIAL_RARITIES_PER_PACK } from "../Constants/SpecialRaritiesPerPack";
import { PIG_RARITY_ORDER } from "../Constants/PigRarityOrder";
import { RARITIES_PER_PIG_COUNT } from "../Constants/RaritiesPerPigCount";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GOLDEN_PIG_CHANCE_PER_RARITY } from "../Constants/GoldenPigChancePerRarity";


async function GetUserPigs(db: Firestore, severId: string, userId: string) {
    const pigsCollection = collection(db, `serverInfo/${severId}/users/${userId}/pigs`);
    const userPigs = await getDocs(pigsCollection);

    const userPigsSet: string[] = [];

    userPigs.forEach(pig => {
        if (!userPigsSet.includes(pig.data().PigId)) {
            userPigsSet.push(pig.data().PigId);
        }
    });

    return userPigsSet;
}


function GetAuthor(interaction: Interaction) {
    if (interaction.user === null) {
        return null;
    }

    const user = interaction.user;
    const username = user.username;
    const avatar = user.avatarURL();

    return { name: username, iconURL: avatar === null ? "" : avatar }
}


async function GetAvailablePigsFromPack(db: Firestore, msgInfoData: DocumentData) {
    let pigs: QuerySnapshot;

    if ((msgInfoData.Set as string).length !== 0) {
        const packQuery = query(collection(db, "pigs"), where("Set", "==", msgInfoData.Set));
        pigs = await getDocs(packQuery);
    } else if ((msgInfoData.Tags as string[]).length !== 0) {
        const packQuery = query(collection(db, "pigs"), where("Tags", "array-contains-any", msgInfoData.Tags));
        pigs = await getDocs(packQuery);
    } else {
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
            if (pig.data().Rarity === key) {
                list.push(pig);
            }
        });
    }

    return pigsPerRarity;
}


async function ChoosePigs(db: Firestore, serverId: string, availablePigs: { [key: string]: QueryDocumentSnapshot[] }, msgInfoData: DocumentData) {
    const serverInfoDoc = doc(db, `serverInfo/${serverId}`);
    const serverInfo = await getDoc(serverInfoDoc);
    const serverInfoData = serverInfo.data();

    let allowGoldenPig: boolean = true;

    if(serverInfoData !== undefined){
        if(serverInfoData.HasSpawnedGoldenPig !== undefined){
            allowGoldenPig = serverInfoData.HasSpawnedGoldenPig;
        }
    }

    let pigRarities: string[][] = SPECIAL_RARITIES_PER_PACK[msgInfoData.Name];
    if (pigRarities === undefined) {
        pigRarities = RARITIES_PER_PIG_COUNT[msgInfoData.PigCount];
    }

    const chosenPigs: QueryDocumentSnapshot[] = [];

    pigRarities.forEach(async rarities => {
        let rarity = rarities[0];

        let legendaryChance = 0.01;
        let epicChance = 0.1;
        let rareChance = 0.35;

        if (msgInfoData.Name === "🍀Lucky Pack🍀") {
            legendaryChance = 0.1;
            epicChance = 0.5;
            rareChance = 1;
        } else if (msgInfoData.Name === "🍀Super Lucky Pack🍀") {
            epicChance = 0.35;
        }

        if (rarities.includes("Legendary") && Math.random() < legendaryChance) {
            rarity = "Legendary";
        } else if (rarities.includes("Epic") && Math.random() < epicChance) {
            rarity = "Epic";
        } else if (rarities.includes("Rare") && Math.random() < rareChance) {
            rarity = "Rare";
        }

        const pigsOfRarity = availablePigs[rarity];
        let chosenPig: QueryDocumentSnapshot;

        do {
            chosenPig = pigsOfRarity[Math.floor(Math.random() * pigsOfRarity.length)]
        } while (chosenPigs.includes(chosenPig));

        if(Math.random() <= GOLDEN_PIG_CHANCE_PER_RARITY[rarity]){
            const goldenPigDoc = doc(db, "pigs/500");
            const goldenPig = await getDoc(goldenPigDoc);
            chosenPigs.push(goldenPig as any as QueryDocumentSnapshot);
        }else{
            chosenPigs.push(chosenPig);
        }
    });

    chosenPigs.sort((a, b) => {
        const aOrder = PIG_RARITY_ORDER[a.data().Rarity];
        const bOrder = PIG_RARITY_ORDER[b.data().Rarity];

        return aOrder - bOrder;
    });

    return chosenPigs;
}


async function AddPigsToDB(db: Firestore, chosenPigs: QueryDocumentSnapshot[], serverId: string, userId: string){
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        const newPigCollection = collection(db, `serverInfo/${serverId}/users/${userId}/pigs`);
        await addDoc(newPigCollection, {
            PigId: pig.id
        });
    }
}


function GetNewPigs(chosenPigs: QueryDocumentSnapshot[], playerPigs: string[]){
    const newPigs: string[] = [];

    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];

        if (!playerPigs.includes(pig.id)) {
            newPigs.push(pig.id);
            playerPigs.push(pig.id);
        }
    }

    return newPigs;
}


function GetOpenPackFollowUp(packName: string, chosenPigs: QueryDocumentSnapshot[], newPigs: string[], interaction: Interaction) {
    const openedPackEmbed = new EmbedBuilder()
        .setTitle(`You've opened a ${packName}`)
        .setDescription(`1/${chosenPigs.length}`);

    const imgPath = AddPigRenderToEmbed(openedPackEmbed, chosenPigs[0], newPigs.includes(chosenPigs[0].id));

    if (imgPath === undefined) { return; }

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
    if (author !== null) {
        openedPackEmbed.setAuthor(author);
    }

    return {
        embeds: [openedPackEmbed],
        components: [row],
        files: [imgPath]
    }
}


async function GetUserInfoData(db: Firestore, serverId: string, userId: string){
    const userInfoDoc = doc(db, `serverInfo/${serverId}/users/${userId}`);
    let userInfo = await getDoc(userInfoDoc);
    let userInfoData = userInfo.data();

    if (userInfoData === undefined) {
        await setDoc(userInfoDoc, {
            AssembledPigs: []
        })

        userInfo = await getDoc(userInfoDoc);
        userInfoData = userInfo.data();

        if (userInfoData === undefined) { return; }
    }

    return userInfoData;
}


function GetUserAssembledPigs(userInfoData: DocumentData){
    let userAssembledPigs: string[] = userInfoData.AssembledPigs
    if (userAssembledPigs === undefined) {
        userAssembledPigs = [];
    }

    return userAssembledPigs;
}


async function GetPossibleAssemblyPigs(db: Firestore, chosenPigs: QueryDocumentSnapshot[], userAssembledPigs: String[]){
    const possibleAssemblyPigs: QueryDocumentSnapshot[] = []

    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];

        const assemblyPigQuery = query(collection(db, "pigs"), where("RequiredPigs", "array-contains", pig.id));
        const assemblyPigs = await getDocs(assemblyPigQuery);

        assemblyPigs.forEach(assemblyPig => {
            if (!userAssembledPigs.includes(assemblyPig.id) && !possibleAssemblyPigs.some(x => x.id == assemblyPig.id)) {
                possibleAssemblyPigs.push(assemblyPig);
            }
        });
    }

    return possibleAssemblyPigs;
}


function GetCompletedAssemblyPigs(possibleAssemblyPigs: QueryDocumentSnapshot[], userPigs: string[]){
    const completedAssemblyPigs: QueryDocumentSnapshot[] = [];

    for (let i = 0; i < possibleAssemblyPigs.length; i++) {
        const assemblyPig = possibleAssemblyPigs[i];
        const assemblyPigData = assemblyPig.data();

        if (assemblyPigData === undefined) { continue; }

        let hasAllPigs = true;

        for (let o = 0; o < assemblyPigData.RequiredPigs.length; o++) {
            const requiredPigId = assemblyPigData.RequiredPigs[o];

            if(!userPigs.includes(requiredPigId)){
                hasAllPigs = false;
                break;
            }
        }

        if (hasAllPigs) { 
            completedAssemblyPigs.push(assemblyPig);
        }
    }

    return completedAssemblyPigs;
}


function GetAssemblyPigsFollowUps(completedAssemblyPigs: QueryDocumentSnapshot[], interaction: Interaction){
    const assemblyPigsFollowUps = [];

    for (let i = 0; i < completedAssemblyPigs.length; i++) {
        const pig = completedAssemblyPigs[i];

        const openedPackEmbed = new EmbedBuilder()
            .setTitle(`You've completed a set and obtained a bonus pig!`)

        const imgPath = AddPigRenderToEmbed(openedPackEmbed, pig, false);

        if (imgPath === undefined) { return; }

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
        if (author !== null) {
            openedPackEmbed.setAuthor(author);
        }

        assemblyPigsFollowUps.push({
            embeds: [openedPackEmbed],
            components: [row],
            files: [imgPath]
        });
    }

    return assemblyPigsFollowUps;
}


export const OpenPack = new Button("OpenPack",
    async (_, interaction, db) => {
        await interaction.deferReply();

        const server = interaction.guild;
        if (server === null) { return; }
        const message = interaction.message;

        const msgDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);
        const msgInfo = await getDoc(msgDoc);

        if (!msgInfo.exists() || msgInfo.data().Type !== "RandomPack") { return; }

        const msgInfoData = msgInfo.data();

        const userPigs = await GetUserPigs(db, server.id, interaction.user.id);

        const availablePigs = await GetAvailablePigsFromPack(db, msgInfoData);

        const chosenPigs = await ChoosePigs(db, server.id, availablePigs, msgInfoData);

        await AddPigsToDB(db, chosenPigs, server.id, interaction.user.id);

        const newPigs: string[] = GetNewPigs(chosenPigs, userPigs);

        const openPackFollowUp = GetOpenPackFollowUp(msgInfoData.Name, chosenPigs, newPigs, interaction)

        if (openPackFollowUp === undefined) { return; }

        const userInfoData = await GetUserInfoData(db, server.id, interaction.user.id);

        if(userInfoData === undefined){return; }

        const allCompletedAssemblyPigs: QueryDocumentSnapshot[] = []
    
        while(true){
            const userAssembledPigs = GetUserAssembledPigs(userInfoData);

            const possibleAssemblyPigs = await GetPossibleAssemblyPigs(db, chosenPigs, userAssembledPigs);

            const completedAssemblyPigs = GetCompletedAssemblyPigs(possibleAssemblyPigs, userPigs);
            completedAssemblyPigs.forEach(assemblyPig => {
                userAssembledPigs.push(assemblyPig.id);
            });

            allCompletedAssemblyPigs.concat(completedAssemblyPigs);

            await updateDoc(doc(db, `serverInfo/${server.id}/users/${interaction.user.id}`), {
                AssembledPigs: userAssembledPigs
            })

            if(completedAssemblyPigs.length === 0){
                break;
            }
        }

        const assemblyPigsFollowUps = GetAssemblyPigsFollowUps(allCompletedAssemblyPigs, interaction);

        if(assemblyPigsFollowUps === undefined){ return; }

        await interaction.followUp(openPackFollowUp).then(message => {
            const messageDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);

            setDoc(messageDoc, {
                Type: "PigGallery",
                Pigs: chosenPigs.map(pig => pig.id),
                NewPigs: newPigs,
                CurrentPig: 0,
                User: interaction.user.id
            });
        });

        assemblyPigsFollowUps.forEach(async assemblyPigsFollowUp => {
            await interaction.followUp(assemblyPigsFollowUp);
        });
    }
);