"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPigRenderToEmbed = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const ColorPerPigRarity_1 = require("../Constants/ColorPerPigRarity");
function AddPigRenderToEmbed(embed, pig, isNew) {
    let img = `${pig.ID}.png`;
    if (pig.Tags.includes("gif")) {
        img = `${pig.ID}.gif`;
    }
    if (!fs_1.default.existsSync(`./img/pigs/${img}`)) {
        img = `none.png`;
    }
    const embedDescriptionLines = [];
    if (isNew) {
        embedDescriptionLines.push("***NEW***");
    }
    embedDescriptionLines.push(`_${pig.Rarity}_`);
    embedDescriptionLines.push(pig.Description.length > 0 ? pig.Description : "...");
    embedDescriptionLines.push(`#${pig.ID.padStart(3, "0")}`);
    const embedDescription = embedDescriptionLines.join("\n");
    embed.setFields({
        name: pig.Name,
        value: embedDescription
    })
        .setImage(`attachment://${img}`)
        .setColor(ColorPerPigRarity_1.COLOR_PER_PIG_RARITY[pig.Rarity]);
    return `./img/pigs/${img}`;
}
exports.AddPigRenderToEmbed = AddPigRenderToEmbed;
