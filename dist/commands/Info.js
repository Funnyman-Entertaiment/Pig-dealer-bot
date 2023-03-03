"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Information = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const Bot_1 = require("../Bot");
const Log_1 = require("../Utils/Log");
const Links_1 = require("../Constants/Links");
exports.Information = new Command_1.Command("Information", "gives you a description of the bot as well as a link to our discord server and an invite for you to get this bot in your own server. (note that using this bot in a server with less than 6 members is heavily discouraged and indeed punished.)", false, false, new discord_js_1.SlashCommandBuilder()
    .setName("information")
    .setDescription("Sends a message that contains some general information about Pig Dealer."), async (interaction) => {
    const botUser = Bot_1.client.user;
    if (botUser === null) {
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle("Pig Dealer Bot")
        .setDescription("Pig Dealer might just very well be the greatest bot ever developed for Discord. Mudae, MEE6 and Rhythm tremble before the mighty tread of the pig.")
        .setColor(discord_js_1.Colors.LuminousVividPink)
        .setFooter({
        text: "Invite the bot now!!!"
    })
        .setThumbnail(`attachment://pig_pfp.png`)
        .addFields([
        {
            name: "Open Packs",
            value: "\"Okay, but what does Pig Dealer actually do if it's so great?\" you might ask with a confused look in your beady eyes. Pig Dealer, once assigned to a channel will regularly drop packs of pigs for the fastest to claim and open, containing a handful of swine to add to your collection."
        },
        {
            name: "Immense Swine Variety",
            value: "Pig Dealer offers over 400 pigs to collect with multiple rarities to flaunt to your friends to prove your innate superiority with a pig version of Homer Simpson. Some of them are even holographic!"
        },
        {
            name: "Seasonal events",
            value: "Has all that not convinced you? I'm not surprised. Many people don't know a good thing from a hammer to their cranium. It's not your fault. Maybe this will convince you though: WE HAVE SEASONAL EVENTS!!!! New years? Christmas? Cinco De Mayo? Halloween? You bet your ASS!!!! All of these events offer unique, exclusive pigs which you can show off to your aforementioned friends throughout the year until they can even get the chance to acquire one and get on your level."
        },
        {
            name: "Trading",
            value: "What good is an extremely rare pig version of Jesus Christ if you can only show it off? The answer: NOT MUCH!!! THAT WOULD SUCK!\nTo avoid this issue, we have implemented the ability to trade pigs. Now, your Holographic Gustavo Fring Pig is not only cool, it also serves as extremely lucrative economical advantage and leverage over fellow users!"
        },
        {
            name: "Can You Find The Golden Pig?",
            value: "To close this off, I'll let you in on a secret: Legends whisper of an elusive, outrageously rare pig made of solid gold. No man has come accross it before, so will you be the first?\n\nSO WHAT ARE YOU WAITING FOR?? GIVE THAT HOLLOW SHELL OF UNFULFILLED AMBITION AND ROMANTIC DISSATISFACTION YOU CALL A LIFE THE MEANING IT LACKS: PIG COLLECTING. INVITE THE BOT TO YOUR LOCAL DISCORD SERVER TODAY!!! "
        },
    ]);
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setLabel("Invite the bot!")
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setURL(Links_1.BOT_INVITE_LINK), new discord_js_1.ButtonBuilder()
        .setLabel("Join the server!")
        .setStyle(discord_js_1.ButtonStyle.Link)
        .setURL(Links_1.TRADE_SERVER_INVITE_LINK));
    (0, Log_1.LogInfo)(`User ${(0, Log_1.PrintUser)(interaction.user)} is checking the bot information`);
    interaction.reply({
        embeds: [embed],
        components: [row],
        files: ["./img/pig_pfp.png"]
    });
});
