"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFoilChecksToEmbed = exports.AddPigListRenderToEmbed = exports.AddPigRenderToEmbed = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const Pigs_1 = require("../database/Pigs");
const ColorPerPigRarity_1 = require("../Constants/ColorPerPigRarity");
const PigsPerFoilRarity_1 = require("../Constants/PigsPerFoilRarity");
function AddPigRenderToEmbed(embed, options) {
    const pig = options.pig;
    let img = `${pig.ID}.png`;
    if (pig.Tags.includes("gif")) {
        img = `${pig.ID}.gif`;
    }
    if (!fs_1.default.existsSync(`./img/pigs/${img}`)) {
        img = "none.png";
    }
    const embedDescriptionLines = [];
    if (options.new !== undefined && options.new) {
        embedDescriptionLines.push("***NEW***");
    }
    const rarityTag = pig.Tags.find(tag => tag.startsWith("[RARITY]"));
    if (rarityTag === undefined) {
        embedDescriptionLines.push(`_${pig.Rarity}_`);
    }
    else {
        const showRarity = rarityTag.replace("[RARITY]", "").trim();
        embedDescriptionLines.push(`_${showRarity}_`);
    }
    if (options.showSet !== undefined && options.showSet) {
        let set = pig.Set;
        if (set === "-") {
            set = "Default";
        }
        embedDescriptionLines.push(set);
    }
    embedDescriptionLines.push(pig.Description.length > 0 ? pig.Description : "...");
    if (options.showId === undefined || options.showId) {
        embedDescriptionLines.push(`#${pig.ID.padStart(3, "0")}${options.favourite ? " ⭐" : ""}${options.shared ? " ✅" : ""}`);
    }
    const embedDescription = embedDescriptionLines.join("\n");
    const count = options.count ?? 1;
    embed.setFields({
        name: `${pig.Name} ${count === 1 ? "" : `(${count})`}`,
        value: embedDescription
    })
        .setImage(`attachment://${img}`)
        .setColor(ColorPerPigRarity_1.COLOR_PER_PIG_RARITY[pig.Rarity.replace(" (foil)", "")]);
    return `./img/pigs/${img}`;
}
exports.AddPigRenderToEmbed = AddPigRenderToEmbed;
function AddPigListRenderToEmbed(embed, options) {
    const favouritePigs = options.favouritePigs ?? [];
    const sharedPigs = options.sharedPigs ?? [];
    embed.setFields([]);
    embed.addFields(options.pigs.map(pig => {
        const pigID = pig.ID;
        const count = options.pigCounts[pigID] ?? 1;
        let number = "";
        if (count !== 1) {
            number = ` (${count})`;
        }
        const isFavourite = favouritePigs.includes(pigID);
        const isShared = sharedPigs.includes(pigID);
        const stickers = `${isFavourite ? "⭐" : ""} ${isShared ? "✅" : ""}`.trim();
        const rarityTag = pig.Tags.find(tag => tag.startsWith("[RARITY]"));
        let rarity = pig.Rarity;
        if (rarityTag !== undefined) {
            const showRarity = rarityTag.replace("[RARITY]", "").trim();
            rarity = showRarity;
        }
        return {
            name: `${pig.Name} #${pigID.padStart(3, "0")}${number}`,
            value: `${stickers}${stickers.length > 0 ? "\n" : ""}_${rarity}_\n${pig.Description}`,
            inline: true
        };
    }));
}
exports.AddPigListRenderToEmbed = AddPigListRenderToEmbed;
const FOILED_RARITIES = ["Common", "Rare", "Epic", "Legendary"];
function AddFoilChecksToEmbed(embed, options) {
    let currentSetNum = 0;
    const minSetNum = options.page * 6;
    const maxSetNum = (options.page + 1) * 6;
    const sets = [];
    for (const set in options.pigAmountsPerSet) {
        sets.push(set);
    }
    sets.sort();
    sets.forEach(set => {
        if (currentSetNum < minSetNum) {
            currentSetNum++;
            return;
        }
        else if (currentSetNum >= maxSetNum) {
            return;
        }
        currentSetNum++;
        const pigAmountsPerRarity = options.pigAmountsPerSet[set];
        let fieldDescription = "";
        const pigsOfSet = (0, Pigs_1.GetPigsBySet)(set);
        FOILED_RARITIES.forEach(rarity => {
            if (pigsOfSet.find(x => x.Rarity === rarity) === undefined) {
                return;
            }
            const amount = pigAmountsPerRarity[rarity] ?? 0;
            const targetAmount = PigsPerFoilRarity_1.PIGS_PER_FOIL_RARITY[rarity];
            fieldDescription += `${rarity} ${amount}/${targetAmount} ${amount < targetAmount ? "" : "✅"}\n`;
        });
        embed.addFields({
            name: set === "-" ? "Default" : set,
            value: fieldDescription,
            inline: true
        });
    });
    return currentSetNum >= maxSetNum;
}
exports.AddFoilChecksToEmbed = AddFoilChecksToEmbed;
