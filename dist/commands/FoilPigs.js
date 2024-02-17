"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoilPigs = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const GetAuthor_1 = require("../Utils/GetAuthor");
const Pigs_1 = require("../database/Pigs");
const PigsPerFoilRarity_1 = require("../Constants/PigsPerFoilRarity");
const MessageInfo_1 = require("../database/MessageInfo");
function ParseTradePigsString(interaction, pigsString) {
    if (pigsString.trim() === "") {
        return {};
    }
    const pigTokens = pigsString.split(",");
    const pigAmounts = {};
    let hasFoundNonPig = undefined;
    let hasFoundUnformattedPig = undefined;
    pigTokens.forEach(token => {
        if (hasFoundNonPig !== undefined) {
            return;
        }
        if (hasFoundUnformattedPig !== undefined) {
            return;
        }
        const pigID = token.split("(")[0].trim();
        const pig = (0, Pigs_1.GetPig)(pigID);
        if (pig === undefined) {
            hasFoundNonPig = pigID;
            return;
        }
        const pigNumberStr = token.split("(")[1];
        let pigNumber = 1;
        if (pigNumberStr !== undefined) {
            pigNumber = parseInt(pigNumberStr.replace(")", "").trim());
        }
        if (Number.isNaN(pigNumber) || pigNumber <= 0) {
            hasFoundUnformattedPig = token;
            return;
        }
        if (pigAmounts[pigID] === undefined) {
            pigAmounts[pigID] = 0;
        }
        pigAmounts[pigID] += pigNumber;
    });
    if (hasFoundNonPig !== undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You're trying to give something that isn't a pig")
            .setDescription(`You need to type the pig's id, but you typed: ${hasFoundNonPig}`)
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return undefined;
    }
    if (hasFoundUnformattedPig !== undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You typed something wrong")
            .setDescription(`The bot found some issue trying to figure out what pigs you wanted to give from here: ${hasFoundUnformattedPig}`)
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return undefined;
    }
    return pigAmounts;
}
function GetFieldDescriptionFromPigAmounts(pigAmounts) {
    const descriptionLines = [];
    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const pig = (0, Pigs_1.GetPig)(pigID);
        if (pig === undefined) {
            continue;
        }
        descriptionLines.push(`${pig.Name} #${pig.ID.padStart(3, "0")} (${amount})`);
    }
    if (descriptionLines.length === 0) {
        descriptionLines.push("Nothing");
    }
    let description = "";
    for (let i = 0; i < descriptionLines.length; i++) {
        const line = descriptionLines[i];
        const currLength = description.length;
        const lineLength = line.length;
        if (currLength + lineLength >= 999) {
            description += "Too many pigs to display";
            break;
        }
        description += line;
        if (i != descriptionLines.length - 1) {
            description += "\n";
        }
    }
    return description;
}
exports.FoilPigs = new Command_1.Command("Foil Pigs", "Used to craft a foil pig, using 100 common, 50 rare, 15 epic or 5 legendary pigs from the same set.\nAllows you to manually input the IDs of the selected pigs, following the same syntax as all other ID defining commands: pigs:1,2,3,4.\nNote that the 0 digits at the start of lower digit IDs are purely cosmetic and are not needed when searching by ID. E.G. ACAB Pig (001) becomes only 1 when putting it into a command.", false, true, new discord_js_1.SlashCommandBuilder()
    .setName("foilpigs")
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("set")
    .setDescription("Set to build the foil for.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("rarity")
    .setDescription("Rarity of the foil to build")
    .setChoices({
    name: "Common",
    value: "Common"
}, {
    name: "Rare",
    value: "Rare"
}, {
    name: "Epic",
    value: "Epic"
}, {
    name: "Legendary",
    value: "Legendary"
})
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("pigs")
    .setDescription("Pigs used to craft. Put their ids separated by commas.")
    .setRequired(true))
    .setDescription("Attempt to craft a foil pig using other random pigs for a set and rarity.")
    .setDMPermission(false), async function (interaction, _serverInfo, userInfo) {
    if (userInfo === undefined) {
        return;
    }
    const server = interaction.guild;
    if (server === null) {
        return;
    }
    const user = interaction.user;
    const options = interaction.options;
    let targetSet = options.getString("set", true).toLowerCase().trim();
    const targetRarity = options.getString("rarity", true);
    const unparsedOfferedPigs = options.getString("pigs", true);
    const offeredPigs = ParseTradePigsString(interaction, unparsedOfferedPigs);
    if (offeredPigs === undefined) {
        return;
    }
    if (targetSet === "default") {
        targetSet = "-";
    }
    const pigs = (0, Pigs_1.GetAllPigs)();
    const pigsOfSet = pigs.filter(pig => pig.Set.toLowerCase().trim() === targetSet.trim());
    if (pigsOfSet.length === 0) {
        const emptyEmbed = new discord_js_1.EmbedBuilder()
            .setAuthor((0, GetAuthor_1.GetAuthor)(interaction))
            .setColor(discord_js_1.Colors.DarkRed)
            .setTitle("This set doesn't exist!")
            .setDescription("Make sure you spelled it correctly.");
        await interaction.reply({
            embeds: [emptyEmbed]
        });
        return;
    }
    const pigsOfSetAndRarity = pigsOfSet.filter(pig => pig.Rarity === targetRarity);
    if (pigsOfSetAndRarity.length === 0) {
        const emptyEmbed = new discord_js_1.EmbedBuilder()
            .setAuthor((0, GetAuthor_1.GetAuthor)(interaction))
            .setColor(discord_js_1.Colors.DarkRed)
            .setTitle("This set doesn't have pigs of that rarity!");
        await interaction.reply({
            embeds: [emptyEmbed]
        });
        return;
    }
    const userPigs = userInfo.Pigs;
    const neededPigs = PigsPerFoilRarity_1.PIGS_PER_FOIL_RARITY[targetRarity];
    let givenPigsNum = 0;
    const actualOfferedPigs = {};
    for (const id in offeredPigs) {
        const amount = offeredPigs[id];
        const actualAmount = userPigs[id] ?? 0;
        if (amount > actualAmount) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("You're trying to offer more pigs than you have")
                .setDescription(`You're offering ${amount} of #${id.padStart(3, "0")} when you actually have ${actualAmount}.`)
                .setColor(discord_js_1.Colors.DarkRed)
                .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
            return;
        }
        if (pigsOfSetAndRarity.find(p => p.ID === id) === undefined) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("You're trying to offer a pig that doesn't meet the requirements!")
                .setDescription(`You're offering #${id.padStart(3, "0")} but its set or rarity don't match.`)
                .setColor(discord_js_1.Colors.DarkRed)
                .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
            return;
        }
        const offeredAmount = Math.min(neededPigs - givenPigsNum, amount);
        actualOfferedPigs[id] = offeredAmount;
        givenPigsNum += offeredAmount;
        if (givenPigsNum >= neededPigs) {
            break;
        }
    }
    if (givenPigsNum < neededPigs) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("You need to offer more pigs!")
            .setDescription(`You're offering ${givenPigsNum} pigs when you actually need to offer ${neededPigs}.`)
            .setColor(discord_js_1.Colors.DarkRed)
            .setAuthor((0, GetAuthor_1.GetAuthor)(interaction));
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${user.username} is trying to craft a ${targetRarity} foil!`)
        .setDescription("All these pigs will be taken from you to craft the foil.")
        .addFields({
        name: "**Offered Pigs**",
        value: GetFieldDescriptionFromPigAmounts(offeredPigs)
    })
        .setAuthor((0, GetAuthor_1.GetAuthor)(interaction))
        .setColor(discord_js_1.Colors.DarkVividPink);
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("AcceptFoil")
        .setLabel("Accept")
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId("CancelFoil")
        .setLabel("Cancel")
        .setStyle(discord_js_1.ButtonStyle.Danger));
    await interaction.deferReply();
    await interaction.followUp({
        embeds: [successEmbed],
        components: [row]
    }).then(message => {
        (0, MessageInfo_1.AddMessageInfoToCache)(new MessageInfo_1.PigFoilMessage(message.id, server.id, user.id, actualOfferedPigs, targetSet, targetRarity));
    });
});
