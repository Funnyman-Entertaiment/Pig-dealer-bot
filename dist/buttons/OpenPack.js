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
async function GetAvailablePigsFromPack(db, msgInfoData) {
    let pigs;
    if (msgInfoData.Set.length !== 0) {
        const packQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("Set", "==", msgInfoData.Set));
        pigs = await (0, lite_1.getDocs)(packQuery);
    }
    else if (msgInfoData.Tags.length !== 0) {
        const packQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("Tags", "array-contains-any", msgInfoData.Tags));
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
                list.push(pig);
            }
        });
    }
    return pigsPerRarity;
}
async function ChoosePigs(db, serverId, availablePigs, msgInfoData) {
    const serverInfoDoc = (0, lite_1.doc)(db, `serverInfo/${serverId}`);
    const serverInfo = await (0, lite_1.getDoc)(serverInfoDoc);
    const serverInfoData = serverInfo.data();
    let allowGoldenPig = true;
    if (serverInfoData !== undefined) {
        if (serverInfoData.HasSpawnedGoldenPig !== undefined) {
            allowGoldenPig = !serverInfoData.HasSpawnedGoldenPig;
        }
    }
    let pigRarities = SpecialRaritiesPerPack_1.SPECIAL_RARITIES_PER_PACK[msgInfoData.Name];
    if (pigRarities === undefined) {
        pigRarities = RaritiesPerPigCount_1.RARITIES_PER_PIG_COUNT[msgInfoData.PigCount];
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
            const goldenPigDoc = (0, lite_1.doc)(db, "pigs/500");
            const goldenPig = await (0, lite_1.getDoc)(goldenPigDoc);
            chosenPigs.push(goldenPig);
            allowGoldenPig = false;
        }
        else {
            chosenPigs.push(chosenPig);
        }
    });
    await (0, lite_1.updateDoc)(serverInfoDoc, {
        HasSpawnedGoldenPig: !allowGoldenPig
    });
    chosenPigs.sort((a, b) => {
        const aOrder = PigRarityOrder_1.PIG_RARITY_ORDER[a.data().Rarity];
        const bOrder = PigRarityOrder_1.PIG_RARITY_ORDER[b.data().Rarity];
        return aOrder - bOrder;
    });
    return chosenPigs;
}
async function AddPigsToDB(db, chosenPigs, serverId, userId) {
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        const newPigCollection = (0, lite_1.collection)(db, `serverInfo/${serverId}/users/${userId}/pigs`);
        await (0, lite_1.addDoc)(newPigCollection, {
            PigId: pig.id
        });
    }
}
function GetNewPigs(chosenPigs, playerPigs) {
    const newPigs = [];
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        if (!playerPigs.includes(pig.id)) {
            newPigs.push(pig.id);
            playerPigs.push(pig.id);
        }
    }
    return newPigs;
}
function GetOpenPackFollowUp(packName, chosenPigs, newPigs, interaction) {
    const openedPackEmbed = new builders_1.EmbedBuilder()
        .setTitle(`You've opened a ${packName}`)
        .setDescription(`1/${chosenPigs.length}`);
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, chosenPigs[0], newPigs.includes(chosenPigs[0].id));
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
    const userInfoDoc = (0, lite_1.doc)(db, `serverInfo/${serverId}/users/${userId}`);
    let userInfo = await (0, lite_1.getDoc)(userInfoDoc);
    let userInfoData = userInfo.data();
    if (userInfoData === undefined) {
        await (0, lite_1.setDoc)(userInfoDoc, {
            AssembledPigs: []
        });
        userInfo = await (0, lite_1.getDoc)(userInfoDoc);
        userInfoData = userInfo.data();
        if (userInfoData === undefined) {
            return;
        }
    }
    return userInfoData;
}
function GetUserAssembledPigs(userInfoData) {
    let userAssembledPigs = userInfoData.AssembledPigs;
    if (userAssembledPigs === undefined) {
        userAssembledPigs = [];
    }
    return userAssembledPigs;
}
async function GetPossibleAssemblyPigs(db, chosenPigs, userAssembledPigs) {
    const possibleAssemblyPigs = [];
    for (let i = 0; i < chosenPigs.length; i++) {
        const pig = chosenPigs[i];
        const assemblyPigQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("RequiredPigs", "array-contains", pig.id));
        const assemblyPigs = await (0, lite_1.getDocs)(assemblyPigQuery);
        assemblyPigs.forEach(assemblyPig => {
            if (!userAssembledPigs.includes(assemblyPig.id) && !possibleAssemblyPigs.some(x => x.id == assemblyPig.id)) {
                possibleAssemblyPigs.push(assemblyPig);
            }
        });
    }
    return possibleAssemblyPigs;
}
function GetCompletedAssemblyPigs(possibleAssemblyPigs, userPigs) {
    const completedAssemblyPigs = [];
    for (let i = 0; i < possibleAssemblyPigs.length; i++) {
        const assemblyPig = possibleAssemblyPigs[i];
        const assemblyPigData = assemblyPig.data();
        if (assemblyPigData === undefined) {
            continue;
        }
        let hasAllPigs = true;
        for (let o = 0; o < assemblyPigData.RequiredPigs.length; o++) {
            const requiredPigId = assemblyPigData.RequiredPigs[o];
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
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("⚠Error fetching server from interaction⚠")
            .setDescription("Message anna or thicco inmediatly!!")
            .setColor(discord_js_1.Colors.DarkRed);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const userInfoData = await GetUserInfoData(db, server.id, interaction.user.id);
    if (userInfoData === undefined) {
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("⚠Error fetching server user data⚠")
            .setDescription("Message anna or thicco inmediatly!!")
            .setColor(discord_js_1.Colors.DarkRed);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const lastTimeOpened = userInfoData.LastTimeOpened;
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
    const message = interaction.message;
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('OpenPack')
        .setLabel('Open!')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(true));
    message.edit({
        components: [row]
    });
    const userDoc = (0, lite_1.doc)(db, `serverInfo/${server.id}/users/${interaction.user.id}`);
    await (0, lite_1.updateDoc)(userDoc, {
        LastTimeOpened: currentTime
    });
    const msgDoc = (0, lite_1.doc)(db, `serverInfo/${server.id}/messages/${message.id}`);
    const msgInfo = await (0, lite_1.getDoc)(msgDoc);
    const msgInfoData = msgInfo.data();
    if (!msgInfo.exists() || msgInfoData === undefined || msgInfo.data().Type !== "RandomPack") {
        if (!msgInfo.exists()) {
            console.log(`Message with id ${message.id} doesn't exist for server ${server.id}.`);
        }
        else if (msgInfoData === undefined) {
            console.log(`Message with id ${message.id} for server ${server.id} doesn't have data.`);
        }
        else if (msgInfoData.Type !== "RandomPack") {
            console.log(`Trying to open a non random pack in message ${message.id} for server ${server.id}.`);
        }
        else {
            console.log(`Something is very wrong with message ${message.id} for server ${server.id}.`);
        }
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("⚠Error fetching message info⚠")
            .setDescription("Message anna or thicco inmediatly!!")
            .setColor(discord_js_1.Colors.DarkRed);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const userPigs = await GetUserPigs(db, server.id, interaction.user.id);
    const availablePigs = await GetAvailablePigsFromPack(db, msgInfoData);
    const chosenPigs = await ChoosePigs(db, server.id, availablePigs, msgInfoData);
    await AddPigsToDB(db, chosenPigs, server.id, interaction.user.id);
    const newPigs = GetNewPigs(chosenPigs, userPigs);
    const openPackFollowUp = GetOpenPackFollowUp(msgInfoData.Name, chosenPigs, newPigs, interaction);
    if (openPackFollowUp === undefined) {
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("⚠Error creating open pack follow up⚠")
            .setDescription("Message anna or thicco inmediatly!!")
            .setColor(discord_js_1.Colors.DarkRed);
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const allCompletedAssemblyPigs = [];
    while (true) {
        const userAssembledPigs = GetUserAssembledPigs(userInfoData);
        const possibleAssemblyPigs = await GetPossibleAssemblyPigs(db, chosenPigs, userAssembledPigs);
        const completedAssemblyPigs = GetCompletedAssemblyPigs(possibleAssemblyPigs, userPigs);
        completedAssemblyPigs.forEach(assemblyPig => {
            userAssembledPigs.push(assemblyPig.id);
        });
        allCompletedAssemblyPigs.concat(completedAssemblyPigs);
        await (0, lite_1.updateDoc)((0, lite_1.doc)(db, `serverInfo/${server.id}/users/${interaction.user.id}`), {
            AssembledPigs: userAssembledPigs
        });
        if (completedAssemblyPigs.length === 0) {
            break;
        }
    }
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
            Pigs: chosenPigs.map(pig => pig.id),
            NewPigs: newPigs,
            CurrentPig: 0,
            User: interaction.user.id
        });
    });
    assemblyPigsFollowUps.forEach(async (assemblyPigsFollowUp) => {
        await interaction.followUp(assemblyPigsFollowUp);
    });
});
