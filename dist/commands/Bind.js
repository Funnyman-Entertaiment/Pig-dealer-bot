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
function GetUserPigs(userInfo) {
    if (userInfo === undefined) {
        return [];
    }
    const userPigs = [];
    for (const pigId in userInfo.Pigs) {
        userPigs.push(pigId);
    }
    return userPigs;
}
exports.ShowBinder = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("binder")
    .addUserOption(option => option.setName('user')
    .setDescription('user to check the binder of'))
    .setDescription("Let's you check your own or someone else's pig binder")
    .setDMPermission(false), async (interaction) => {
    await interaction.deferReply();
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const user = interaction.options.getUser('user');
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
    const userInfo = await (0, UserInfo_1.GetUserInfo)(userId);
    const pigs = GetUserPigs(userInfo);
    if (pigs.length === 0) {
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
        .setTitle(`${author.name}'s pig bind`)
        .setDescription(`1/${pigs.length}`)
        .setAuthor(author);
    const imgPath = (0, PigRenderer_1.AddPigRenderToEmbed)(openedPackEmbed, {
        pig: firstPig,
        count: userInfo?.Pigs[firstPig.ID] ?? 1
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
    await interaction.followUp({
        embeds: [openedPackEmbed],
        components: [row],
        files: [imgPath]
    }).then(message => {
        const newMessage = new MessageInfo_1.PigGalleryMessage(message.id, server.id, 0, userInfo === undefined ? {} : userInfo.Pigs, pigs, [], [], interaction.user.id);
        (0, MessageInfo_1.AddMessageInfoToCache)(newMessage);
    });
    console.log("\n");
});
