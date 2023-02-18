"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Catalogue = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Pigs_1 = require("../database/Pigs");
const PigRenderer_1 = require("../Utils/PigRenderer");
const MessageInfo_1 = require("../database/MessageInfo");
const Log_1 = require("../Utils/Log");
exports.Catalogue = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("catalogue")
    .addStringOption(option => option.setName("rarity")
    .setDescription("Filter pigs by rarity. Multiple rarities separated by commas."))
    .setDescription("Shows all pigs in the bot sorted by set")
    .setDMPermission(false), async (interaction) => {
    await interaction.deferReply();
    const serverId = interaction.guild?.id;
    if (serverId === undefined) {
        return;
    }
    const options = interaction.options;
    const rarities = options.getString('rarity') ?? "";
    const raritiesToFilter = rarities.split(',')
        .map(rarity => rarity.trim().toLowerCase())
        .filter(rarity => rarity.length > 0);
    let pigs = (0, Pigs_1.GetAllPigs)();
    if (raritiesToFilter.length > 0) {
        pigs = pigs.filter(pig => {
            return raritiesToFilter.includes(pig.Rarity.toLowerCase());
        });
    }
    const pigsBySet = {};
    const sets = [];
    pigs.forEach(pig => {
        if (pigsBySet[pig.Set] === undefined) {
            pigsBySet[pig.Set] = [];
        }
        pigsBySet[pig.Set].push(pig.ID);
        if (!sets.includes(pig.Set)) {
            sets.push(pig.Set);
        }
    });
    for (const set in pigsBySet) {
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
        .setTitle("Pig Catalogue")
        .setDescription(`**${firstSet === "-" ? "Default" : firstSet}**`)
        .setColor(discord_js_1.Colors.DarkVividPink);
    const firstPigsPage = pigsBySet[firstSet].slice(0, Math.min(pigsBySet[firstSet].length, 9));
    (0, PigRenderer_1.AddPigListRenderToEmbed)(catalogueEmbed, {
        pigs: firstPigsPage.map(id => (0, Pigs_1.GetPig)(id)).filter(pig => pig !== undefined),
        pigCounts: {}
    });
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
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
    (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is checking the pig catalogue`);
    await interaction.followUp({
        ephemeral: true,
        embeds: [catalogueEmbed],
        components: [row]
    }).then(message => {
        const messageInfo = new MessageInfo_1.PigListMessage(message.id, serverId, {}, pigsBySet, [], [], firstSet, 0, interaction.user.id);
        (0, MessageInfo_1.AddMessageInfoToCache)(messageInfo);
    });
});
