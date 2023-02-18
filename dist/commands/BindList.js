"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowBinderList = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const GetAuthor_1 = require("../Utils/GetAuthor");
const Log_1 = require("../Utils/Log");
const Pigs_1 = require("../database/Pigs");
const UserInfo_1 = require("../database/UserInfo");
const PigRenderer_1 = require("../Utils/PigRenderer");
const MessageInfo_1 = require("../database/MessageInfo");
exports.ShowBinderList = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("binderlist")
    .addBooleanOption(option => option.setName('set')
    .setDescription('Whether to order the pigs by set or not.'))
    .addUserOption(option => option.setName('user')
    .setDescription('User to check the binder of.'))
    .addStringOption(option => option.setName('rarity')
    .setDescription('Filter pigs by rarity. Separate by commas to filter for several rarities.'))
    .addBooleanOption(option => option.setName('favourites')
    .setDescription('show only favourite pigs'))
    .setDescription("Let's you check your own or someone else's pig binder")
    .setDMPermission(false), async (interaction) => {
    await interaction.deferReply();
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const options = interaction.options;
    const user = options.getUser('user');
    const orderBySet = options.getBoolean('set') ?? false;
    const rarities = options.getString('rarity') ?? "";
    const raritiesToFilter = rarities.split(',')
        .map(rarity => rarity.trim().toLowerCase())
        .filter(rarity => rarity.length > 0);
    let userId;
    let author;
    if (user === null) {
        (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is checking its own binder`);
        author = (0, GetAuthor_1.GetAuthor)(interaction);
        if (author === null) {
            return;
        }
        userId = interaction.user.id;
    }
    else {
        (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is checking the binder of ${(0, Log_1.PrintUser)(user)}`);
        userId = user.id;
        const username = user.username;
        const avatar = user.avatarURL();
        author = { name: username, iconURL: avatar === null ? "" : avatar };
    }
    const userInfo = await (0, UserInfo_1.GetUserInfo)(userId);
    let pigs = (0, UserInfo_1.GetUserPigs)(userInfo);
    if (userInfo === undefined) {
        const emptyEmbed = new discord_js_1.EmbedBuilder()
            .setAuthor(author)
            .setColor(discord_js_1.Colors.DarkRed)
            .setTitle("This user has no pigs!")
            .setDescription("Open some packs, loser");
        await interaction.followUp({
            embeds: [emptyEmbed]
        });
        return;
    }
    if (raritiesToFilter.length > 0) {
        pigs = pigs.filter(pig => {
            return raritiesToFilter.includes(pig.Rarity.toLowerCase());
        });
    }
    const onlyFavourites = options.getBoolean('favourites') ?? false;
    if (onlyFavourites) {
        pigs = pigs.filter(pig => userInfo.FavouritePigs.includes(pig.ID));
    }
    if (userInfo === undefined || pigs.length === 0) {
        const emptyEmbed = new discord_js_1.EmbedBuilder()
            .setAuthor(author)
            .setColor(discord_js_1.Colors.DarkRed)
            .setTitle("This user has no pigs!")
            .setDescription("Open some packs, loser");
        await interaction.followUp({
            embeds: [emptyEmbed]
        });
        return;
    }
    const pigsBySet = {};
    const sets = [];
    if (orderBySet) {
        pigs.forEach(pig => {
            if (pigsBySet[pig.Set] === undefined) {
                pigsBySet[pig.Set] = [];
            }
            pigsBySet[pig.Set].push(pig.ID);
        });
    }
    else {
        pigsBySet['Pigs'] = pigs.map(pig => pig.ID);
    }
    for (const set in pigsBySet) {
        if (!sets.includes(set)) {
            sets.push(set);
        }
        const pigs = pigsBySet[set];
        pigsBySet[set] = pigs.sort((a, b) => {
            try {
                const numA = parseInt(a);
                const numB = parseInt(b);
                return numA - numB;
            }
            catch {
                return a.localeCompare(b);
            }
        });
    }
    sets.sort();
    const firstSet = sets[0];
    const catalogueEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${author.name}'s pig binder`)
        .setDescription(`**${firstSet === "-" ? "Default" : firstSet}**`)
        .setColor(discord_js_1.Colors.DarkVividPink)
        .setAuthor(author);
    const interactionUserInfo = await (0, UserInfo_1.GetUserInfo)(interaction.user.id);
    const sharedPigs = (0, UserInfo_1.GetUserPigIDs)(interactionUserInfo);
    const firstPigsPage = pigsBySet[firstSet].slice(0, Math.min(pigsBySet[firstSet].length, 9));
    (0, PigRenderer_1.AddPigListRenderToEmbed)(catalogueEmbed, {
        pigs: firstPigsPage.map(id => (0, Pigs_1.GetPig)(id)).filter(pig => pig !== undefined),
        pigCounts: userInfo?.Pigs ?? {},
        favouritePigs: userInfo?.FavouritePigs ?? [],
        sharedPigs: userInfo.ID === interaction.user.id ? [] : sharedPigs
    });
    const row = new discord_js_1.ActionRowBuilder();
    if (orderBySet) {
        row.addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('SetPrevious')
            .setLabel('⏪ Prev. Set')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId('ListPrevious')
            .setLabel('Previous')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(true), new discord_js_1.ButtonBuilder()
            .setCustomId('ListNext')
            .setLabel('Next')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(pigsBySet[firstSet].length <= 9), new discord_js_1.ButtonBuilder()
            .setCustomId('SetNext')
            .setLabel('Next. Set ⏩')
            .setStyle(discord_js_1.ButtonStyle.Secondary));
    }
    else {
        row.addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('ListPrevious')
            .setLabel('Previous')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(true), new discord_js_1.ButtonBuilder()
            .setCustomId('ListNext')
            .setLabel('Next')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(pigsBySet[firstSet].length <= 9));
    }
    await interaction.followUp({
        ephemeral: true,
        embeds: [catalogueEmbed],
        components: [row]
    }).then(message => {
        const messageInfo = new MessageInfo_1.PigListMessage(message.id, server.id, userInfo === undefined ? {} : userInfo.Pigs, pigsBySet, userInfo?.FavouritePigs ?? [], userInfo.ID === interaction.user.id ? [] : sharedPigs, firstSet, 0, interaction.user.id);
        (0, MessageInfo_1.AddMessageInfoToCache)(messageInfo);
    });
});
