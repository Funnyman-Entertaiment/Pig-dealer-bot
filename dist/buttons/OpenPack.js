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
const Packs_1 = require("../database/Packs");
const fs_1 = require("fs");
const SignificantPigIDs_1 = require("../Constants/SignificantPigIDs");
const SignificantPackIDs_1 = require("../Constants/SignificantPackIDs");
const AssemblyyPigs_1 = require("../Utils/AssemblyyPigs");
const GetAuthor_1 = require("../Utils/GetAuthor");
const Variables_1 = require("../Constants/Variables");
function GetEditedEmbed(embed, pack) {
    let openedImg = `./img/packs/opened/${pack.ID}.png`;
    if (!(0, fs_1.existsSync)(openedImg)) {
        return;
    }
    embed.setImage(`attachment://${pack.ID}.png`);
    return openedImg;
}
function CanUserOpenPack(interaction, userInfo, msgInfo) {
    if (msgInfo.User !== undefined && msgInfo.User !== userInfo.ID) {
        const notYourPackEmbed = new builders_1.EmbedBuilder()
            .setTitle("This pack is not for you!")
            .setDescription("Wait for another pack to drop and open that one you greedy pig.")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [notYourPackEmbed],
            ephemeral: true
        });
        return false;
    }
    if (msgInfo.Opened) {
        const notYourPackEmbed = new builders_1.EmbedBuilder()
            .setTitle("This pack has already been opened!")
            .setDescription("Give the message a moment to update and you'll see someone claimed it before you.")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [notYourPackEmbed],
            ephemeral: true
        });
        return false;
    }
    const lastTimeOpened = userInfo.LastTimeOpened;
    const currentTime = lite_1.Timestamp.now();
    if (lastTimeOpened !== undefined &&
        currentTime.seconds - lastTimeOpened.seconds <= 60 * Variables_1.Cooldowns.MINUTES_PACK_OPENING_CD &&
        !msgInfo.IgnoreCooldown) {
        const totalDiff = (60 * Variables_1.Cooldowns.MINUTES_PACK_OPENING_CD) - (currentTime.seconds - lastTimeOpened.seconds);
        const minutes = Math.floor(totalDiff / 60);
        const seconds = totalDiff % 60;
        const waitEmbed = new builders_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.DarkRed)
            .setTitle(`You must wait for ${minutes}:${seconds.toString().padStart(2, "0")} minutes to open another pack`)
            .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
        interaction.reply({
            embeds: [waitEmbed],
            ephemeral: true,
            options: {
                ephemeral: true
            }
        });
        return false;
    }
    return true;
}
function SetUserCooldown(msgInfo, userInfo, server, interaction) {
    if (msgInfo.IgnoreCooldown) {
        return;
    }
    userInfo.LastTimeOpened = lite_1.Timestamp.now();
    if (server.memberCount > 5) {
        return;
    }
    const warningEmbed = new builders_1.EmbedBuilder()
        .setTitle("This server is too small")
        .setDescription(`To avoid cheating, the bot will give you an extended cooldown. ${userInfo.WarnedAboutCooldown ? "" : "\nSince this is your first time, you won't be penalized."}`)
        .setColor(discord_js_1.Colors.DarkOrange);
    interaction.followUp({
        embeds: [warningEmbed],
    });
    if (userInfo.WarnedAboutCooldown) {
        userInfo.LastTimeOpened = lite_1.Timestamp.fromMillis(userInfo.LastTimeOpened.toMillis() + 1000 * 60 * 60 * 96);
    }
    userInfo.WarnedAboutCooldown = true;
}
function EditEmbedWithOpenedPack(message, pack, embed) {
    const editedEmbed = new builders_1.EmbedBuilder(embed.data);
    const openedImg = GetEditedEmbed(editedEmbed, pack);
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('OpenPack')
        .setLabel('Open!')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(true));
    if (openedImg === undefined) {
        message.edit({
            components: [row]
        });
    }
    else {
        message.edit({
            embeds: [editedEmbed],
            components: [row],
            files: [openedImg],
        });
    }
}
function GetUserPigs(userInfo) {
    const userPigs = [];
    for (const pigId in userInfo.Pigs) {
        userPigs.push(pigId);
    }
    return userPigs;
}
function GetAvailablePigsFromPack(pack) {
    let pigs;
    if (pack.Set.length !== 0) {
        pigs = (0, Pigs_1.GetPigsBySet)(pack.Set);
    }
    else if (pack.Tags.length !== 0) {
        pigs = (0, Pigs_1.GetPigsWithTag)(pack.Tags);
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
function GetPigRaritiesFromPack(pack) {
    if (SpecialRaritiesPerPack_1.SPECIAL_RARITIES_PER_PACK[pack.Name] === undefined) {
        return RaritiesPerPigCount_1.RARITIES_PER_PIG_COUNT[pack.PigCount];
    }
    return SpecialRaritiesPerPack_1.SPECIAL_RARITIES_PER_PACK[pack.Name];
}
function GetRandomRarityFromWeightedList(rarities) {
    let rarity = "";
    for (const possibleRarity in rarities) {
        const chance = rarities[possibleRarity];
        if (Math.random() > chance) {
            break;
        }
        rarity = possibleRarity;
    }
    return rarity;
}
function ChooseRandomPigFromList(pigs) {
    return pigs[Math.floor(Math.random() * pigs.length)];
}
function ChoosePigs(serverInfo, pack) {
    const availablePigsForPack = GetAvailablePigsFromPack(pack);
    const pigRaritiesForPack = GetPigRaritiesFromPack(pack);
    let allowGoldenPig = !serverInfo.HasSpawnedGoldenPig;
    const chosenPigs = [];
    pigRaritiesForPack.forEach(async (rarities) => {
        const rarity = GetRandomRarityFromWeightedList(rarities);
        const pigsOfRarity = availablePigsForPack[rarity];
        let chosenPig;
        do {
            chosenPig = ChooseRandomPigFromList(pigsOfRarity);
        } while (chosenPigs.includes(chosenPig));
        const goldenPigChance = GoldenPigChancePerRarity_1.GOLDEN_PIG_CHANCE_PER_RARITY[rarity] ?? 0;
        if (Math.random() <= goldenPigChance && allowGoldenPig) {
            const goldenPig = (0, Pigs_1.GetPig)(SignificantPigIDs_1.GOLDEN_PIG);
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
function ChristmasEvent(chosenPigs, pigsToShowInPack, pack) {
    if (!(0, SeasonalEvents_1.IsChristmas)()) {
        return;
    }
    if (pack.ID === SignificantPackIDs_1.STOCKING_PACK) {
        return;
    }
    if (Math.random() < 0.05) {
        const stockingPig = (0, Pigs_1.GetPig)(SignificantPigIDs_1.STOCKING_PIG);
        if (stockingPig !== undefined) {
            pigsToShowInPack.push(stockingPig);
        }
    }
    else if (Math.random() < 0.1) {
        const christmasPigs = (0, Pigs_1.GetPigsByRarity)("Christmas");
        const chosenChristmasPig = ChooseRandomPigFromList(christmasPigs);
        chosenPigs.push(chosenChristmasPig);
    }
}
function NewYearEvent(chosenPigs, serverInfo) {
    return;
    if (!(0, SeasonalEvents_1.IsNewYear)()) {
        return;
    }
    const currentYear = (0, SeasonalEvents_1.GetNewYearsYear)();
    if (!serverInfo.YearsSpawnedAllNewYearDeco.includes(currentYear) && Math.random() < 0.1) {
        const newYearPigs = (0, Pigs_1.GetPigsByRarity)("New Year");
        const chosenNewYearPigs = newYearPigs[Math.floor(Math.random() * newYearPigs.length)];
        chosenPigs.push(chosenNewYearPigs);
    }
}
function GetOpenPackFollowUp(packName, chosenPigs, newPigs, interaction) {
    const openedPackEmbed = new builders_1.EmbedBuilder()
        .setTitle(`You've opened a ${packName}`)
        .setDescription(`1/${chosenPigs.length}`);
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, {
        pig: chosenPigs[0],
        new: newPigs.includes(chosenPigs[0].ID),
        count: 1
    });
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
    const author = (0, GetAuthor_1.GetAuthor)(interaction);
    if (author !== null) {
        openedPackEmbed.setAuthor(author);
    }
    return {
        embeds: [openedPackEmbed],
        components: [row],
        files: [imgPath]
    };
}
function SendOpenPackFollowUp(userInfo, chosenPigs, pigsToShowInPack, pack, serverId, interaction) {
    const userPigs = GetUserPigs(userInfo);
    const newPigs = chosenPigs.filter(pig => !userPigs.includes(pig.ID)).map(pig => pig.ID);
    const packFollowUp = GetOpenPackFollowUp(pack.Name, pigsToShowInPack, newPigs, interaction);
    if (packFollowUp === undefined) {
        return;
    }
    interaction.followUp(packFollowUp).then(message => {
        if (message === null) {
            return;
        }
        const newMsgInfo = new MessageInfo_1.PigGalleryMessage(message.id, serverId, 0, {}, pigsToShowInPack.map(pig => pig.ID), newPigs, [], interaction.user.id);
        (0, MessageInfo_1.AddMessageInfoToCache)(newMsgInfo);
    });
}
function AddPigsToUser(chosenPigs, userInfo) {
    chosenPigs.forEach(pig => {
        const count = userInfo.Pigs[pig.ID];
        if (count === undefined) {
            userInfo.Pigs[pig.ID] = 1;
        }
        else {
            userInfo.Pigs[pig.ID] = count + 1;
        }
    });
}
exports.OpenPack = new Button_1.Button("OpenPack", async (interaction) => {
    if (interaction.guild === null) {
        return;
    }
    const server = interaction.guild;
    const user = interaction.user;
    const message = interaction.message;
    const serverID = server.id;
    const userID = user.id;
    const msgID = message.id;
    const serverInfo = await (0, ServerInfo_1.GetServerInfo)(serverID);
    const userInfo = await (0, UserInfo_1.GetUserInfo)(userID) ?? new UserInfo_1.UserInfo(userID, [], {}, false);
    (0, UserInfo_1.AddUserInfoToCache)(userInfo);
    const msgInfo = (0, MessageInfo_1.GetMessageInfo)(serverID, msgID);
    if (msgInfo === undefined) {
        const errorEmbed = new builders_1.EmbedBuilder()
            .setTitle("This message has expired")
            .setDescription("Messages expire after ~3 hours of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const pack = (0, Packs_1.GetPack)(msgInfo.Pack);
    if (pack === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Could't find pack for this message", `Pack Id: ${msgInfo.Pack}`);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true,
        });
        return;
    }
    if (!CanUserOpenPack(interaction, userInfo, msgInfo)) {
        return;
    }
    await interaction.deferReply();
    msgInfo.Opened = true;
    SetUserCooldown(msgInfo, userInfo, server, interaction);
    const embed = message.embeds[0];
    if (embed === undefined) {
        (0, Log_1.LogError)(`Couldn't get embed from message in channel ${(0, Log_1.PrintChannel)(interaction.channel)} in server ${(0, Log_1.PrintServer)(server)}`);
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });
        return;
    }
    EditEmbedWithOpenedPack(message, pack, embed);
    (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} opened ${pack.Name} pack in server ${(0, Log_1.PrintServer)(server)}`);
    const chosenPigs = ChoosePigs(serverInfo, pack).filter(x => x !== undefined);
    const pigsToShowInPack = [...chosenPigs];
    ChristmasEvent(chosenPigs, pigsToShowInPack, pack);
    NewYearEvent(chosenPigs, serverInfo);
    SendOpenPackFollowUp(userInfo, chosenPigs, pigsToShowInPack, pack, serverID, interaction);
    AddPigsToUser(chosenPigs, userInfo);
    const assembledPigs = await (0, AssemblyyPigs_1.CheckAndSendAssemblyPigEmbeds)(serverID, userID, chosenPigs);
    if (assembledPigs === undefined) {
        return;
    }
    if (assembledPigs.some(pig => pig.ID === SignificantPigIDs_1.ASSEMBLY_NEW_YEAR_PIG)) {
        const serverInfo = await (0, ServerInfo_1.GetServerInfo)(server.id);
        const currentYear = (0, SeasonalEvents_1.GetNewYearsYear)();
        serverInfo.YearsSpawnedAllNewYearDeco.push(currentYear);
    }
});
