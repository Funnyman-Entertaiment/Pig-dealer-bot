"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPackDropper = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const PackDropper_1 = require("../events/PackDropper");
exports.ResetPackDropper = new Command_1.Command("", "", new discord_js_1.SlashCommandBuilder()
    .setName("resetpackdrops")
    .setDescription("Resets pack drops. Only use if absolutely necessary or pack drops may duplicate."), async (interaction) => {
    (0, PackDropper_1.PackDropper)();
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("Succesfully reset pack dropping")
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed],
        ephemeral: true
    });
});
