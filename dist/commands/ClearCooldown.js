"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearCooldown = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const UserInfo_1 = require("../database/UserInfo");
exports.ClearCooldown = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("clearcooldown")
    .addStringOption(option => option.setName('user')
    .setDescription('user to check the cooldown of')
    .setRequired(true))
    .setDescription("Clears the pack opening cooldown of a user")
    .setDMPermission(false), async function (interaction) {
    const options = interaction.options;
    const userID = options.getString("user", true);
    const userInfo = await (0, UserInfo_1.GetUserInfo)(userID);
    if (userInfo === undefined) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("User not found in database")
            .setColor(discord_js_1.Colors.Red);
        interaction.reply({
            embeds: [errorEmbed]
        });
        return;
    }
    userInfo.LastTimeOpened = undefined;
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle("User's cooldown has been reset")
        .setColor(discord_js_1.Colors.Green);
    interaction.reply({
        embeds: [successEmbed]
    });
});
