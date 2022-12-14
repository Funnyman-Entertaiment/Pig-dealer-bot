"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenPack = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const Button_1 = require("../Button");
const SpecialRaritiesPerPack_1 = require("../Constants/SpecialRaritiesPerPack");
const PigRarityOrder_1 = require("../Constants/PigRarityOrder");
const RaritiesPerPigCount_1 = require("../Constants/RaritiesPerPigCount");
const PigRenderer_1 = require("../Utils/PigRenderer");
const GoldenPigChancePerRarity_1 = require("../Constants/GoldenPigChancePerRarity");
const Errors_1 = require("../Utils/Errors");
const UserInfo_1 = require("../database/UserInfo");
const MessageInfo_1 = require("../database/MessageInfo");
const Pigs_1 = require("../database/Pigs");
const ServerInfo_1 = require("../database/ServerInfo");
async function GetUserPigs(db, severId, userId) {
    const pigsCollection = (0, lite_1.collection)(db, `serverInfo/${severId}/users/${userId}/pigs`);
    const userPigs = await (0, lite_1.getDocs)(pigsCollection);
    const userPigsSet = [];
    userPigs.forEach(pig => {
        if (!userPigsSet.includes(pig.data().PigId)) {
            userPigsSet.push(pig.data().PigId);
        }
    });
    return userPigsSet;
}
function GetAuthor(interaction) {
    if (interaction.user === null) {
        return null;
    }
    const user = interaction.user;
    const username = user.username;
    const avatar = user.avatarURL();
    return { name: username, iconURL: avatar === null ? "" : avatar };
}
async function GetAvailablePigsFromPack(db, msgInfo) {
    let pigs;
    if (msgInfo.Set.length !== 0) {
        const packQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("Set", "==", msgInfo.Set));
        pigs = await (0, lite_1.getDocs)(packQuery);
    }
    else if (msgInfo.Tags.length !== 0) {
        const packQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("Tags", "array-contains-any", msgInfo.Tags));
        pigs = await (0, lite_1.getDocs)(packQuery);
    }
    else {
        const packQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"));
        pigs = await (0, lite_1.getDocs)(packQuery);
    }
    const pigsPerRarity = {
        Common: [],
        Rare: [],
        Epic: [],
        Legendary: [],
    };
    for (const key in pigsPerRarity) {
        const list = pigsPerRarity[key];
        pigs.forEach(pig => {
            if (pig.data().Rarity === key) {
                const pigObject = (0, Pigs_1.CreatePigFromData)(pig.id, pig.data());
                list.push(pigObject);
            }
        });
    }
    return pigsPerRarity;
}
async function ChoosePigs(db, serverId, availablePigs, msgInfo) {
    const serverInfo = await (0, ServerInfo_1.GetServerInfo)(serverId, db);
    let allowGoldenPig = true;
    allowGoldenPig = !serverInfo.HasSpawnedGoldenPig;
    let pigRarities = SpecialRaritiesPerPack_1.SPECIAL_RARITIES_PER_PACK[msgInfo.Name];
    if (pigRarities === undefined) {
        pigRarities = RaritiesPerPigCount_1.RARITIES_PER_PIG_COUNT[msgInfo.PigCount];
    }
    const chosenPigs = [];
    pigRarities.forEach(async (rarities) => {
        let rarity = "";
        for (const possibleRarity in rarities) {
            const chance = rarities[possibleRarity];
            if (Math.random() > chance) {
                break;
            }
            rarity = possibleRarity;
        }
        const pigsOfRarity = availablePigs[rarity];
        let chosenPig;
        do {
            chosenPig = pigsOfRarity[Math.floor(Math.random() * pigsOfRarity.length)];
        } while (chosenPigs.includes(chosenPig));
        if (Math.random() <= GoldenPigChancePerRarity_1.GOLDEN_PIG_CHANCE_PER_RARITY[rarity] && allowGoldenPig) {
            const goldenPig = await (0, Pigs_1.GetPig)("500", db);
            if (goldenPig !== undefined) {
                chosenPigs.push(goldenPig);
                allowGoldenPig = false;
            }
        }
        else {
            chosenPigs.push(chosenPig);
        }
    });
    serverInfo.HasSpawnedGoldenPig = !allowGoldenPig;
    chosenPigs.sort((a, b) => {
        const aOrder = PigRarityOrder_1.PIG_RARITY_ORDER[a.Rarity];
        const bOrder = PigRarityOrder_1.PIG_RARITY_ORDER[b.Rarity];
        return aOrder - bOrder;
    });
    return chosenPigs;
}
async function AddPigsToDB(db, chosenPigs, serverId, userId) {
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        const newPigCollection = (0, lite_1.collection)(db, `serverInfo/${serverId}/users/${userId}/pigs`);
        await (0, lite_1.addDoc)(newPigCollection, {
            PigId: pig.ID
        });
    }
}
function GetNewPigs(chosenPigs, playerPigs) {
    const newPigs = [];
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        if (!playerPigs.includes(pig.ID)) {
            newPigs.push(pig.ID);
            playerPigs.push(pig.ID);
        }
    }
    return newPigs;
}
function GetOpenPackFollowUp(packName, chosenPigs, newPigs, interaction) {
    const openedPackEmbed = new builders_1.EmbedBuilder()
        .setTitle(`You've opened a ${packName}`)
        .setDescription(`1/${chosenPigs.length}`);
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, chosenPigs[0], newPigs.includes(chosenPigs[0].ID));
    if (imgPath === undefined) {
        return;
    }
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(true), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary));
    const author = GetAuthor(interaction);
    if (author !== null) {
        openedPackEmbed.setAuthor(author);
    }
    return {
        embeds: [openedPackEmbed],
        components: [row],
        files: [imgPath]
    };
}
async function GetUserInfoData(db, serverId, userId) {
    const userInfo = await (0, UserInfo_1.GetUserInfo)(serverId, userId, db);
    if (userInfo === undefined) {
        const newUserInfo = new UserInfo_1.UserInfo(userId, serverId, []);
        await (0, UserInfo_1.AddUserInfoToCache)(newUserInfo, db);
        return newUserInfo;
    }
    return userInfo;
}
function GetUserAssembledPigs(userInfo) {
    let userAssembledPigs = userInfo.AssembledPigs;
    return userAssembledPigs;
}
async function GetPossibleAssemblyPigs(db, chosenPigs, userAssembledPigs) {
    const possibleAssemblyPigs = [];
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        const assemblyPigQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("RequiredPigs", "array-contains", pig.ID));
        const assemblyPigs = await (0, lite_1.getDocs)(assemblyPigQuery);
        assemblyPigs.forEach(assemblyPig => {
            if (!userAssembledPigs.includes(assemblyPig.id) && !possibleAssemblyPigs.some(x => x.ID == assemblyPig.id)) {
                possibleAssemblyPigs.push((0, Pigs_1.CreatePigFromData)(assemblyPig.id, assemblyPig.data()));
            }
        });
    }
    return possibleAssemblyPigs;
}
function GetCompletedAssemblyPigs(possibleAssemblyPigs, userPigs) {
    const completedAssemblyPigs = [];
    for (let i = 0; i < possibleAssemblyPigs.length; i++) {
        const assemblyPig = possibleAssemblyPigs[i];
        let hasAllPigs = true;
        for (let o = 0; o < assemblyPig.RequiredPigs.length; o++) {
            const requiredPigId = assemblyPig.RequiredPigs[o];
            if (!userPigs.includes(requiredPigId)) {
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
function GetAssemblyPigsFollowUps(completedAssemblyPigs, interaction) {
    const assemblyPigsFollowUps = [];
    for (let i = 0; i < completedAssemblyPigs.length; i++) {
        const pig = completedAssemblyPigs[i];
        const openedPackEmbed = new builders_1.EmbedBuilder()
            .setTitle(`You've completed a set and obtained a bonus pig!`);
        const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, pig, false);
        if (imgPath === undefined) {
            return;
        }
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('GalleryPrevious')
            .setLabel('Previous')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(true), new discord_js_1.ButtonBuilder()
            .setCustomId('GalleryNext')
            .setLabel('Next')
            .setStyle(discord_js_1.ButtonStyle.Primary));
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
exports.OpenPack = new Button_1.Button("OpenPack", async (_, interaction, db) => {
    await interaction.deferReply();
    const server = interaction.guild;
    if (server === null) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Error fetching server from interaction", "Where did you find this message?");
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const message = interaction.message;
    const msgInfo = await (0, MessageInfo_1.GetMessageInfo)(server.id, message.id, db);
    if (msgInfo === undefined || msgInfo.Type !== "RandomPack") {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Error fetching message information", `Server: ${server.id}`, `Message: ${message.id}`);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    if (msgInfo.Opened) {
        return;
    }
    const userInfo = await GetUserInfoData(db, server.id, interaction.user.id);
    const lastTimeOpened = userInfo.LastTimeOpened;
    const currentTime = lite_1.Timestamp.now();
    if (lastTimeOpened !== undefined && currentTime.seconds - lastTimeOpened.seconds <= 60 * 30) {
        const totalDiff = (60 * 30) - (currentTime.seconds - lastTimeOpened.seconds);
        const minutes = Math.floor(totalDiff / 60);
        const seconds = totalDiff % 60;
        const waitEmbed = new builders_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.DarkRed)
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
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('OpenPack')
        .setLabel('Open!')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(true));
    message.edit({
        components: [row]
    });
    const userPigs = await GetUserPigs(db, server.id, interaction.user.id);
    const availablePigs = await GetAvailablePigsFromPack(db, msgInfo);
    const chosenPigs = await ChoosePigs(db, server.id, availablePigs, msgInfo);
    (0, Pigs_1.AddPigsToCache)(chosenPigs, db);
    await AddPigsToDB(db, chosenPigs, server.id, interaction.user.id);
    const newPigs = GetNewPigs(chosenPigs, userPigs);
    const openPackFollowUp = GetOpenPackFollowUp(msgInfo.Name, chosenPigs, newPigs, interaction);
    if (openPackFollowUp === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Error creating open pack follow up");
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const allCompletedAssemblyPigs = [];
    while (true) {
        const userAssembledPigs = GetUserAssembledPigs(userInfo);
        const possibleAssemblyPigs = await GetPossibleAssemblyPigs(db, chosenPigs, userAssembledPigs);
        const completedAssemblyPigs = GetCompletedAssemblyPigs(possibleAssemblyPigs, userPigs);
        completedAssemblyPigs.forEach(assemblyPig => {
            userAssembledPigs.push(assemblyPig.ID);
        });
        allCompletedAssemblyPigs.concat(completedAssemblyPigs);
        await (0, lite_1.updateDoc)((0, lite_1.doc)(db, `serverInfo/${server.id}/users/${interaction.user.id}`), {
            AssembledPigs: userAssembledPigs
        });
        if (completedAssemblyPigs.length === 0) {
            break;
        }
    }
    (0, Pigs_1.AddPigsToCache)(allCompletedAssemblyPigs, db);
    const assemblyPigsFollowUps = GetAssemblyPigsFollowUps(allCompletedAssemblyPigs, interaction);
    if (assemblyPigsFollowUps === undefined) {
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("⚠Error creating assembly pigs follow up⚠")
            .setDescription("Message anna or thicco inmediatly!!")
            .setColor(discord_js_1.Colors.DarkRed);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    await interaction.followUp(openPackFollowUp).then(message => {
        const messageDoc = (0, lite_1.doc)(db, `serverInfo/${server.id}/messages/${message.id}`);
        (0, lite_1.setDoc)(messageDoc, {
            Type: "PigGallery",
            Pigs: chosenPigs.map(pig => pig.ID),
            NewPigs: newPigs,
            CurrentPig: 0,
            User: interaction.user.id
        });
    });
    assemblyPigsFollowUps.forEach(async (assemblyPigsFollowUp) => {
        await interaction.followUp(assemblyPigsFollowUp);
    });
});
