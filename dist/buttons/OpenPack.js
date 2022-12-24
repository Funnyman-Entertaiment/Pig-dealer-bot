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
const SeasonalEvents_1 = require("../Utils/SeasonalEvents");
const Log_1 = require("../Utils/Log");
const v = {
    SpawnStocking: false
};
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
async function GetAvailablePigsFromPack(msgInfo) {
    let pigs;
    if (msgInfo.Set.length !== 0) {
        pigs = (0, Pigs_1.GetPigsBySet)(msgInfo.Set);
    }
    else if (msgInfo.Tags.length !== 0) {
        pigs = (0, Pigs_1.GetPigsWithTag)(msgInfo.Tags);
    }
    else {
        pigs = (0, Pigs_1.GetAllPigs)();
    }
    const pigsPerRarity = {};
    pigs.forEach(pig => {
        if (pigsPerRarity[pig.Rarity] === undefined) {
            pigsPerRarity[pig.Rarity] = [];
        }
        const pigsOfRarity = pigsPerRarity[pig.Rarity];
        pigsOfRarity.push(pig);
    });
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
        const goldenPigChance = GoldenPigChancePerRarity_1.GOLDEN_PIG_CHANCE_PER_RARITY[rarity] ?? 0;
        if (Math.random() <= goldenPigChance && allowGoldenPig) {
            const goldenPig = (0, Pigs_1.GetPig)("500");
            if (goldenPig !== undefined) {
                chosenPigs.push(goldenPig);
                allowGoldenPig = false;
            }
        }
        else {
            chosenPigs.push(chosenPig);
        }
    });
    if ((0, SeasonalEvents_1.IsChristmas)() && msgInfo.Name !== "Stocking") {
        if (Math.random() < 1) {
            v.SpawnStocking = true;
        }
        else if (Math.random() < 0.1) {
            const christmasPigs = (0, Pigs_1.GetPigsByRarity)("Christmas");
            const chosenChristmasPig = christmasPigs[Math.floor(Math.random() * christmasPigs.length)];
            chosenPigs.push(chosenChristmasPig);
        }
    }
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
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, chosenPigs[0], newPigs.includes(chosenPigs[0].ID), true);
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
async function GetPossibleAssemblyPigs(chosenPigs, userAssembledPigs) {
    const assemblyPigs = (0, Pigs_1.GetPigsByRarity)("Assembly");
    const possibleAssemblyPigs = [];
    assemblyPigs.forEach(assemblyPig => {
        for (let i = 0; i < chosenPigs.length; i++) {
            const pig = chosenPigs[i];
            if (assemblyPig.RequiredPigs.includes(pig.ID) &&
                !userAssembledPigs.includes(pig.ID) &&
                !possibleAssemblyPigs.some(x => x.ID === assemblyPig.ID)) {
                possibleAssemblyPigs.push(assemblyPig);
            }
        }
    });
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
        const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, pig, false, true);
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
    if (msgInfo.User !== undefined && msgInfo.User !== interaction.user.id) {
        return;
    }
    if (msgInfo.Opened) {
        return;
    }
    const userInfo = await GetUserInfoData(db, server.id, interaction.user.id);
    const lastTimeOpened = userInfo.LastTimeOpened;
    const currentTime = lite_1.Timestamp.now();
    if (lastTimeOpened !== undefined && currentTime.seconds - lastTimeOpened.seconds <= 60 * 30 && msgInfo.Name !== "Stocking") {
        const totalDiff = (60 * 30) - (currentTime.seconds - lastTimeOpened.seconds);
        const minutes = Math.floor(totalDiff / 60);
        const seconds = totalDiff % 60;
        const waitEmbed = new builders_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.DarkRed)
            .setTitle(`You must wait for ${minutes}:${seconds.toString().padStart(2, "0")} minutes to open another pack`)
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
    (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} opened ${msgInfo.Name} pack in server ${(0, Log_1.PrintServer)(server)}`);
    const userPigs = await GetUserPigs(db, server.id, interaction.user.id);
    const availablePigs = await GetAvailablePigsFromPack(msgInfo);
    const chosenPigs = await ChoosePigs(db, server.id, availablePigs, msgInfo);
    await AddPigsToDB(db, chosenPigs, server.id, interaction.user.id);
    const newPigs = GetNewPigs(chosenPigs, userPigs);
    let openPackFollowUp = GetOpenPackFollowUp(msgInfo.Name, chosenPigs, newPigs, interaction);
    if (v.SpawnStocking) {
        const stockingPig = (0, Pigs_1.GetPig)("306");
        if (stockingPig === undefined) {
            (0, Log_1.LogError)(`Couldn't find stocking pig.`);
            const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't find stocking pig`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }
        const pigsToShow = [...chosenPigs];
        pigsToShow.push(stockingPig);
        openPackFollowUp = GetOpenPackFollowUp(msgInfo.Name, pigsToShow, newPigs, interaction);
    }
    if (openPackFollowUp === undefined) {
        (0, Log_1.LogError)(`Couldn't create a follow up for this pack opening`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Error creating open pack follow up");
        await interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const allCompletedAssemblyPigs = [];
    while (true) {
        const userAssembledPigs = GetUserAssembledPigs(userInfo);
        const possibleAssemblyPigs = await GetPossibleAssemblyPigs(chosenPigs, userAssembledPigs);
        const completedAssemblyPigs = GetCompletedAssemblyPigs(possibleAssemblyPigs, userPigs);
        completedAssemblyPigs.forEach(assemblyPig => {
            userAssembledPigs.push(assemblyPig.ID);
        });
        allCompletedAssemblyPigs.concat(completedAssemblyPigs);
        userInfo.AssembledPigs = userAssembledPigs;
        if (completedAssemblyPigs.length === 0) {
            break;
        }
    }
    const assemblyPigsFollowUps = GetAssemblyPigsFollowUps(allCompletedAssemblyPigs, interaction);
    if (assemblyPigsFollowUps === undefined) {
        (0, Log_1.LogError)(`Couldn't create a follow up for this pack's assembly pigs`);
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
        let pigsToShow = [...chosenPigs];
        if (v.SpawnStocking) {
            const stockingPig = (0, Pigs_1.GetPig)("306");
            if (stockingPig === undefined) {
                (0, Log_1.LogError)(`Couldn't find stocking pig.`);
                const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't find stocking pig`);
                interaction.followUp({
                    embeds: [errorEmbed]
                });
                return;
            }
            pigsToShow.push(stockingPig);
        }
        const newMsgInfo = new MessageInfo_1.PigGalleryMessage(message.id, server.id, 0, pigsToShow.map(pig => pig.ID), newPigs, [], interaction.user.id);
        (0, MessageInfo_1.AddMessageInfoToCache)(newMsgInfo, db);
    });
    assemblyPigsFollowUps.forEach(async (assemblyPigsFollowUp) => {
        await interaction.followUp(assemblyPigsFollowUp);
    });
    v.SpawnStocking = false;
    console.log("\n");
});
