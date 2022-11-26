"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPigRenderToEmbed = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const ColorPerPigRarity_1 = require("../Constants/ColorPerPigRarity");
function AddPigRenderToEmbed(embed, pig, isNew) {
    const pigData = pig.data();
    if (pigData === undefined) {
        return;
    }
    let img = `${pig.id}.png`;
    if (pigData.Tags.includes("gif")) {
        img = `${pig.id}.gif`;
    }
    if (!fs_1.default.existsSync(`./img/pigs/${img}`)) {
        img = `none.png`;
    }
    const embedDescriptionLines = [];
    if (isNew) {
        embedDescriptionLines.push("***NEW***");
    }
    embedDescriptionLines.push(`_${pigData.Rarity}_`);
    embedDescriptionLines.push(pigData.Description.length > 0 ? pigData.Description : "...");
    embedDescriptionLines.push(`#${pig.id.padStart(3, "0")}`);
    const embedDescription = embedDescriptionLines.join("\n");
    embed.setFields({
        name: pigData.Name,
        value: embedDescription
    })
        .setImage(`attachment://${img}`)
        .setColor(ColorPerPigRarity_1.COLOR_PER_PIG_RARITY[pigData.Rarity]);
    return `./img/pigs/${img}`;
}
exports.AddPigRenderToEmbed = AddPigRenderToEmbed;
