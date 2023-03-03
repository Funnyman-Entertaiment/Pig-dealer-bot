"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckFoils = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const PigRenderer_1 = require("../Utils/PigRenderer");
const MessageInfo_1 = require("../database/MessageInfo");
const FOILED_RARITIES = ["Common", "Rare", "Epic", "Legendary"];
exports.CheckFoils = new Command_1.Command("Check Foils", "Shows you your progress on your eligibility for crafting a foil from every rarity of every set.", false, true, new discord_js_1.SlashCommandBuilder()
    .setName("checkfoils")
    .setDescription("Gives you a list of all foils you can craft.")
    .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
    .setName("onlydupes")
    .setDescription("Whether to only count dupe pigs or not. Default is true."))
    .setDMPermission(false), async function (interaction, _serverInfo, userInfo) {
    if (userInfo === undefined) {
        return;
    }
    const options = interaction.options;
    const onlydupes = options.getBoolean("onlydupes") ?? true;
    const user = interaction.user;
    if (userInfo === undefined) {
        const noPigsEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You have no pigs!")
            .setDescription("Open some packs loser!")
            .setColor(discord_js_1.Colors.DarkRed);
        interaction.reply({
            embeds: [noPigsEmbed],
            ephemeral: true
        });
        return;
    }
    const userPigs = userInfo.Pigs;
    const pigAmountsPerSet = {};
    const pigs = (0, Pigs_1.GetAllPigs)();
    pigs.forEach(pig => {
        if (!FOILED_RARITIES.includes(pig.Rarity)) {
            return;
        }
        let userAmount = userPigs[pig.ID] ?? 0;
        userAmount = userAmount / 1;
        if (onlydupes) {
            userAmount = Math.max(0, userAmount - 1);
        }
        if (pigAmountsPerSet[pig.Set] === undefined) {
            pigAmountsPerSet[pig.Set] = {};
        }
        const pigAmountsPerRarity = pigAmountsPerSet[pig.Set];
        if (pigAmountsPerRarity[pig.Rarity] === undefined) {
            pigAmountsPerRarity[pig.Rarity] = 0;
        }
        pigAmountsPerRarity[pig.Rarity] += userAmount;
    });
    const checkFoilsEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("List of set's you can craft foils of")
        .setColor(discord_js_1.Colors.DarkVividPink);
    (0, PigRenderer_1.AddFoilChecksToEmbed)(checkFoilsEmbed, {
        page: 0,
        pigAmountsPerSet: pigAmountsPerSet
    });
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("PreviousFoilCheck")
        .setLabel("Previous")
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId("NextFoilCheck")
        .setLabel("Next")
        .setStyle(discord_js_1.ButtonStyle.Primary));
    await interaction.deferReply();
    interaction.followUp({
        embeds: [checkFoilsEmbed],
        components: [row]
    }).then(message => {
        const guild = message.guild;
        if (guild === null) {
            return;
        }
        (0, MessageInfo_1.AddMessageInfoToCache)(new MessageInfo_1.FoilChecksMessage(message.id, guild.id, user.id, pigAmountsPerSet));
    });
});
