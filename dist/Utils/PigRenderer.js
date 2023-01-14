"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPigListRenderToEmbed = exports.AddPigRenderToEmbed = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const ColorPerPigRarity_1 = require("../Constants/ColorPerPigRarity");
function AddPigRenderToEmbed(embed, options) {
    const pig = options.pig;
    let img = `${pig.ID}.png`;
    if (pig.Tags.includes("gif")) {
        img = `${pig.ID}.gif`;
    }
    if (!fs_1.default.existsSync(`./img/pigs/${img}`)) {
        img = `none.png`;
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
        .setColor(ColorPerPigRarity_1.COLOR_PER_PIG_RARITY[pig.Rarity]);
    return `./img/pigs/${img}`;
}
exports.AddPigRenderToEmbed = AddPigRenderToEmbed;
function AddPigListRenderToEmbed(embed, options) {
    const favouritePigs = options.favouritePigs ?? [];
    const sharedPigs = options.sharedPigs ?? [];
    embed.setFields([]);
    embed.addFields(options.pigs.map(pig => {
        const count = options.pigCounts[pig.ID] ?? 1;
        let number = "";
        if (count !== 1) {
            number = ` (${count})`;
        }
        const isFavourite = favouritePigs.includes(pig.ID);
        const isShared = sharedPigs.includes(pig.ID);
        const stickers = `${isFavourite ? "⭐" : ""} ${isShared ? "✅" : ""}`.trim();
        return {
            name: `${pig.Name} #${pig.ID.padStart(3, "0")}${number}`,
            value: `${stickers}${stickers.length > 0 ? "\n" : ""}_${pig.Rarity}_\n${pig.Description}`,
            inline: true
        };
    }));
}
exports.AddPigListRenderToEmbed = AddPigListRenderToEmbed;
