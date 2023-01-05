"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
exports.Invite = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("invite")
    .setDescription("Sends you an invitation link so you can have Pig Dealer in your own server."), async (interaction) => {
    if (interaction.guild === null) {
        interaction.reply("https://discord.com/api/oauth2/authorize?client_id=1040735137228406884&permissions=268470272&scope=bot%20applications.commands");
    }
    else {
        interaction.user.send("https://discord.com/api/oauth2/authorize?client_id=1040735137228406884&permissions=268470272&scope=bot%20applications.commands");
        interaction.reply({
            content: "Message sent!",
            ephemeral: true
        });
    }
});
