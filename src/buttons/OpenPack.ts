import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, Interaction } from "discord.js";
import { addDoc, collection, doc, DocumentData, Firestore, getDoc, getDocs, query, QueryDocumentSnapshot, QuerySnapshot, setDoc, Timestamp, updateDoc, where } from "firebase/firestore/lite";
import { Button } from "../Button";
import { SPECIAL_RARITIES_PER_PACK } from "../Constants/SpecialRaritiesPerPack";
import { PIG_RARITY_ORDER } from "../Constants/PigRarityOrder";
import { RARITIES_PER_PIG_COUNT } from "../Constants/RaritiesPerPigCount";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GOLDEN_PIG_CHANCE_PER_RARITY } from "../Constants/GoldenPigChancePerRarity";
import { MakeErrorEmbed } from "../Utils/Errors";
import { AddUserInfoToCache, GetUserInfo, UserInfo } from "../database/UserInfo";
import { GetMessageInfo, RandomPackMessage } from "../database/MessageInfo";
import { AddPigsToCache, CreatePigFromData, GetPig, Pig } from "../database/Pigs";
import { GetServerInfo, ServerInfo } from "../database/ServerInfo";


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


async function GetAvailablePigsFromPack(db: Firestore, msgInfo: RandomPackMessage) {
    let pigs: QuerySnapshot;

    if (msgInfo.Set.length !== 0) {
        const packQuery = query(collection(db, "pigs"), where("Set", "==", msgInfo.Set));
        pigs = await getDocs(packQuery);
    } else if ((msgInfo.Tags as string[]).length !== 0) {
        const packQuery = query(collection(db, "pigs"), where("Tags", "array-contains-any", msgInfo.Tags));
        pigs = await getDocs(packQuery);
    } else {
        const packQuery = query(collection(db, "pigs"));
        pigs = await getDocs(packQuery);
    }

    const pigsPerRarity: { [key: string]: Pig[] } = {
        Common: [],
        Rare: [],
        Epic: [],
        Legendary: [],
    }

    for (const key in pigsPerRarity) {
        const list: Pig[] = pigsPerRarity[key];

        pigs.forEach(pig => {
            if (pig.data().Rarity === key) {
                const pigObject = CreatePigFromData(pig.id, pig.data());
                list.push(pigObject);
            }
        });
    }

    return pigsPerRarity;
}


async function ChoosePigs(db: Firestore, serverId: string, availablePigs: { [key: string]: Pig[] }, msgInfo: RandomPackMessage) {
    const serverInfo = await GetServerInfo(serverId, db) as any as ServerInfo;

    let allowGoldenPig: boolean = true;

    allowGoldenPig = !serverInfo.HasSpawnedGoldenPig;

    let pigRarities: {readonly [key: string]: number}[] = SPECIAL_RARITIES_PER_PACK[msgInfo.Name];
    if (pigRarities === undefined) {
        pigRarities = RARITIES_PER_PIG_COUNT[msgInfo.PigCount];
    }

    const chosenPigs: Pig[] = [];

    pigRarities.forEach(async rarities => {
        let rarity: string = "";

        for (const possibleRarity in rarities) {
            const chance = rarities[possibleRarity];

            if(Math.random() > chance){
                break;
            }

            rarity = possibleRarity;
        }

        const pigsOfRarity = availablePigs[rarity];
        let chosenPig: Pig;

        do {
            chosenPig = pigsOfRarity[Math.floor(Math.random() * pigsOfRarity.length)]
        } while (chosenPigs.includes(chosenPig));

        if(Math.random() <= GOLDEN_PIG_CHANCE_PER_RARITY[rarity] && allowGoldenPig){
            const goldenPig = await GetPig("500", db);
            if(goldenPig !== undefined){
                chosenPigs.push(goldenPig);
                allowGoldenPig = false;
            }
        }else{
            chosenPigs.push(chosenPig);
        }
    });

    serverInfo.HasSpawnedGoldenPig = !allowGoldenPig;

    chosenPigs.sort((a, b) => {
        const aOrder = PIG_RARITY_ORDER[a.Rarity];
        const bOrder = PIG_RARITY_ORDER[b.Rarity];

        return aOrder - bOrder;
    });

    return chosenPigs;
}


async function AddPigsToDB(db: Firestore, chosenPigs: Pig[], serverId: string, userId: string){
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        const newPigCollection = collection(db, `serverInfo/${serverId}/users/${userId}/pigs`);
        await addDoc(newPigCollection, {
            PigId: pig.ID
        });
    }
}


function GetNewPigs(chosenPigs: Pig[], playerPigs: string[]){
    const newPigs: string[] = [];

    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];

        if (!playerPigs.includes(pig.ID)) {
            newPigs.push(pig.ID);
            playerPigs.push(pig.ID);
        }
    }

    return newPigs;
}


function GetOpenPackFollowUp(packName: string, chosenPigs: Pig[], newPigs: string[], interaction: Interaction) {
    const openedPackEmbed = new EmbedBuilder()
        .setTitle(`You've opened a ${packName}`)
        .setDescription(`1/${chosenPigs.length}`);

    const imgPath = AddPigRenderToEmbed(openedPackEmbed, chosenPigs[0], newPigs.includes(chosenPigs[0].ID));

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
    const userInfo = await GetUserInfo(serverId, userId, db);

    if(userInfo === undefined){
        const newUserInfo = new UserInfo(
            userId,
            serverId,
            []
        );
        await AddUserInfoToCache(newUserInfo, db);

        return newUserInfo
    }

    return userInfo;
}


function GetUserAssembledPigs(userInfo: UserInfo){
    let userAssembledPigs = userInfo.AssembledPigs;

    return userAssembledPigs;
}


async function GetPossibleAssemblyPigs(db: Firestore, chosenPigs: Pig[], userAssembledPigs: String[]){
    const possibleAssemblyPigs: Pig[] = []

    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];

        const assemblyPigQuery = query(collection(db, "pigs"), where("RequiredPigs", "array-contains", pig.ID));
        const assemblyPigs = await getDocs(assemblyPigQuery);

        assemblyPigs.forEach(assemblyPig => {
            if (!userAssembledPigs.includes(assemblyPig.id) && !possibleAssemblyPigs.some(x => x.ID == assemblyPig.id)) {
                possibleAssemblyPigs.push(CreatePigFromData(assemblyPig.id, assemblyPig.data()));
            }
        });
    }

    return possibleAssemblyPigs;
}


function GetCompletedAssemblyPigs(possibleAssemblyPigs: Pig[], userPigs: string[]){
    const completedAssemblyPigs: Pig[] = [];

    for (let i = 0; i < possibleAssemblyPigs.length; i++) {
        const assemblyPig = possibleAssemblyPigs[i];

        let hasAllPigs = true;

        for (let o = 0; o < assemblyPig.RequiredPigs.length; o++) {
            const requiredPigId = assemblyPig.RequiredPigs[o];

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


function GetAssemblyPigsFollowUps(completedAssemblyPigs: Pig[], interaction: Interaction){
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

        if (server === null) {
            const errorEmbed = MakeErrorEmbed(
                "Error fetching server from interaction",
                "Where did you find this message?"
            );

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }
        const message = interaction.message;
        const msgInfo = await GetMessageInfo(server.id, message.id, db) as RandomPackMessage;

        if(msgInfo === undefined || msgInfo.Type !== "RandomPack"){
            const errorEmbed = MakeErrorEmbed(
                "Error fetching message information",
                `Server: ${server.id}`,
                `Message: ${message.id}`
            );

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        if(msgInfo.Opened){ return; }

        const userInfo = await GetUserInfoData(db, server.id, interaction.user.id);

        const lastTimeOpened = userInfo.LastTimeOpened;
        const currentTime = Timestamp.now();

        if(lastTimeOpened !== undefined && currentTime.seconds - lastTimeOpened.seconds <= 60 * 30){
            const totalDiff = (60 * 30) - (currentTime.seconds - lastTimeOpened.seconds);
            const minutes = Math.floor(totalDiff/60);
            const seconds = totalDiff % 60;

            const waitEmbed = new EmbedBuilder()
                .setColor(Colors.DarkRed)
                .setTitle(`You must wait for ${minutes}:${seconds.toString().padStart(2, "0")} to open another pack`)
                .setAuthor(GetAuthor(interaction));

            await interaction.followUp({
                embeds: [waitEmbed],
                ephemeral: true,
                options: {
                    ephemeral: true
                }
            });

            return;
        }

        msgInfo.Opened = true;
        userInfo.LastTimeOpened = currentTime;

        const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('OpenPack')
                                .setLabel('Open!')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                        );
        message.edit({
            components: [row]
        });

        const userPigs = await GetUserPigs(db, server.id, interaction.user.id);

        const availablePigs = await GetAvailablePigsFromPack(db, msgInfo);

        const chosenPigs = await ChoosePigs(db, server.id, availablePigs, msgInfo);

        AddPigsToCache(chosenPigs, db);

        await AddPigsToDB(db, chosenPigs, server.id, interaction.user.id);

        const newPigs: string[] = GetNewPigs(chosenPigs, userPigs);

        const openPackFollowUp = GetOpenPackFollowUp(msgInfo.Name, chosenPigs, newPigs, interaction)

        if (openPackFollowUp === undefined) {
            const errorEmbed = MakeErrorEmbed(
                "Error creating open pack follow up"
            );

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        const allCompletedAssemblyPigs: Pig[] = []
    
        while(true){
            const userAssembledPigs = GetUserAssembledPigs(userInfo);

            const possibleAssemblyPigs = await GetPossibleAssemblyPigs(db, chosenPigs, userAssembledPigs);

            const completedAssemblyPigs = GetCompletedAssemblyPigs(possibleAssemblyPigs, userPigs);
            completedAssemblyPigs.forEach(assemblyPig => {
                userAssembledPigs.push(assemblyPig.ID);
            });

            allCompletedAssemblyPigs.concat(completedAssemblyPigs);

            await updateDoc(doc(db, `serverInfo/${server.id}/users/${interaction.user.id}`), {
                AssembledPigs: userAssembledPigs
            })

            if(completedAssemblyPigs.length === 0){
                break;
            }
        }

        AddPigsToCache(allCompletedAssemblyPigs, db);

        const assemblyPigsFollowUps = GetAssemblyPigsFollowUps(allCompletedAssemblyPigs, interaction);

        if(assemblyPigsFollowUps === undefined){
            const errorEmbed = new EmbedBuilder()
            .setTitle("⚠Error creating assembly pigs follow up⚠")
            .setDescription("Message anna or thicco inmediatly!!")
            .setColor(Colors.DarkRed);

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        await interaction.followUp(openPackFollowUp).then(message => {
            const messageDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);

            setDoc(messageDoc, {
                Type: "PigGallery",
                Pigs: chosenPigs.map(pig => pig.ID),
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