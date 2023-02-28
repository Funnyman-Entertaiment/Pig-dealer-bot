"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowBinder = void 0;
const discord_js_1 = require("discord.js");
const PigRenderer_1 = require("../Utils/PigRenderer");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const MessageInfo_1 = require("../database/MessageInfo");
const Log_1 = require("../Utils/Log");
const UserInfo_1 = require("../database/UserInfo");
const GetAuthor_1 = require("../Utils/GetAuthor");
exports.ShowBinder = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("binder")
    .addUserOption(option => option.setName('user')
    .setDescription('user to check the binder of'))
    .addStringOption(option => option.setName('rarity')
    .setDescription('filter pigs by rarity'))
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
        (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is checking the binder of ${(0, Log_1.PrintUser)(interaction.user)}`);
        userId = user.id;
        const username = user.username;
        const avatar = user.avatarURL();
        author = { name: username, iconURL: avatar === null ? "" : avatar };
    }
    const rarities = options.getString('rarity') ?? "";
    const raritiesToFilter = rarities.split(',')
        .map(rarity => rarity.trim().toLowerCase())
        .filter(rarity => rarity.length > 0);
    const userInfo = await (0, UserInfo_1.GetUserInfo)(userId);
    let pigs = (0, UserInfo_1.GetUserPigIDs)(userInfo);
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
        pigs = pigs.filter(pigID => {
            const pig = (0, Pigs_1.GetPig)(pigID);
            if (pig === undefined) {
                return false;
            }
            return raritiesToFilter.includes(pig.Rarity.toLowerCase());
        });
    }
    const favouritePigs = userInfo.FavouritePigs;
    const onlyFavourites = options.getBoolean('favourites') ?? false;
    if (onlyFavourites) {
        pigs = pigs.filter(pig => favouritePigs.includes(pig));
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
    pigs.sort((a, b) => {
        try {
            const numA = parseInt(a);
            const numB = parseInt(b);
            return numA - numB;
        }
        catch {
            return a.localeCompare(b);
        }
    });
    const firstPigId = pigs[0];
    const firstPig = (0, Pigs_1.GetPig)(firstPigId);
    if (firstPig === undefined) {
        (0, Log_1.LogError)(`Couldn't find the first pig in the binder (${firstPigId})`);
        return;
    }
    const openedPackEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${author.name}'s pig binder`)
        .setDescription(`1/${pigs.length}`)
        .setAuthor(author);
    const interactionUserInfo = await (0, UserInfo_1.GetUserInfo)(interaction.user.id);
    const sharedPigs = (0, UserInfo_1.GetUserPigIDs)(interactionUserInfo);
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, {
        pig: firstPig,
        count: userInfo?.Pigs[firstPig.ID] ?? 1,
        favourite: favouritePigs.includes(firstPig.ID),
        shared: userInfo.ID === interaction.user.id ? false : sharedPigs.includes(firstPig.ID)
    });
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryPrevious')
        .setLabel('Previous')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(true), new discord_js_1.ButtonBuilder()
        .setCustomId('GalleryNext')
        .setLabel('Next')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(pigs.length === 1));
    if (userInfo.ID === interaction.user.id && !onlyFavourites) {
        if (!favouritePigs.includes(firstPig.ID)) {
            row.addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('FavouritePig')
                .setLabel('Favourite ⭐')
                .setStyle(discord_js_1.ButtonStyle.Secondary));
        }
        else {
            row.addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId('UnfavouritePig')
                .setLabel('Unfavourite ⭐')
                .setStyle(discord_js_1.ButtonStyle.Secondary));
        }
    }
    await interaction.followUp({
        embeds: [openedPackEmbed],
        components: [row],
        files: [imgPath]
    }).then(message => {
        const newMessage = new MessageInfo_1.PigGalleryMessage(message.id, server.id, 0, userInfo === undefined ? {} : userInfo.Pigs, pigs, [], [], userInfo.FavouritePigs, userInfo.ID === interaction.user.id ? [] : sharedPigs, userInfo.ID === interaction.user.id && !onlyFavourites, interaction.user.id);
        (0, MessageInfo_1.AddMessageInfoToCache)(newMessage);
    });
});
