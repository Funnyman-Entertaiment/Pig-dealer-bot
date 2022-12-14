"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeErrorEmbed = void 0;
const discord_js_1 = require("discord.js");
function MakeErrorEmbed(title, ...descriptions) {
    let description = "Message anna or thicco inmediatly!!";
    descriptions.forEach(extraDescriptionLine => {
        description = extraDescriptionLine + "\n" + description;
    });
    const errorEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`⚠${title}⚠`)
        .setDescription(description)
        .setColor(discord_js_1.Colors.DarkRed);
    return errorEmbed;
}
exports.MakeErrorEmbed = MakeErrorEmbed;
