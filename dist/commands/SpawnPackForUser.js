"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpawnPackUser = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const ServerInfo_1 = require("../database/ServerInfo");
const Packs_1 = require("../database/Packs");
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const DropPack_1 = require("../Utils/DropPack");
const Errors_1 = require("../Utils/Errors");
const SendMessage_1 = require("../Utils/SendMessage");
const Log_1 = require("../Utils/Log");
exports.SpawnPackUser = new Command_1.Command("", "", new discord_js_1.SlashCommandBuilder()
    .setName("spawnpackuser")
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("pack")
    .setDescription("ID of the pack to spawn.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("user")
    .setDescription("ID of the user that will receive the pack.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("server")
    .setDescription("Server id to send the pack in.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("title")
    .setDescription("Title of the dropped pack embed."))
    .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
    .setName("ping")
    .setDescription("Whether or not to ping the user. Defaults to not pinging."))
    .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
    .setName("ignorecooldown")
    .setDescription("Whether or not users with cooldown will be able to open the pack. Defaults to not ignoring."))
    .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"), async (interaction) => {
    await interaction.deferReply();
    const options = interaction.options;
    const packID = options.getString("pack");
    if (packID === null) {
        return;
    }
    const pack = (0, Packs_1.GetPack)(packID);
    if (pack === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Pack not found`, `PackID: ${packID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const title = options.getString("title");
    const ping = options.getBoolean("ping") ?? false;
    const ignoreCooldown = options.getBoolean("ignorecooldown") ?? false;
    const userID = options.getString("user");
    if (userID === null) {
        return;
    }
    const serverID = options.getString("server");
    if (serverID === null) {
        return;
    }
    let serverInfo = await (0, ServerInfo_1.GetServerInfo)(serverID);
    if (serverInfo === undefined) {
        const docRef = (0, lite_1.doc)(Bot_1.db, `serverInfo/${serverID}`);
        const serverDoc = await (0, lite_1.getDoc)(docRef);
        if (serverDoc.exists()) {
            serverInfo = (0, ServerInfo_1.CreateServerInfoFromData)(serverDoc.id, serverDoc.data());
        }
        else {
            const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`No server found with that id`, `ID: ${serverID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }
    }
    if (serverInfo.Channel === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`The server doesn't have a channel set`, `ID: ${serverID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    let server;
    try {
        server = await Bot_1.client.guilds.fetch(serverID);
    }
    catch {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`The bot doesn't have access to that server`, `ID: ${serverID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    let user;
    try {
        user = await server.members.fetch(userID);
    }
    catch {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`The couldn't find the user in that server`, `Server: ${(0, Log_1.PrintServer)(server)}`, `UserID: ${userID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    if (user === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`The couldn't find the user in that server`, `Server: ${(0, Log_1.PrintServer)(server)}`, `UserID: ${userID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    let embedTitle = `A ${pack.Name} HAS APPEARED!`;
    let vowelRegex = '^[aieouAIEOU].*';
    let matched = pack.Name.match(vowelRegex);
    if (matched) {
        embedTitle = `AN ${pack.Name} HAS APPEARED!`;
    }
    if (ping) {
        await (0, SendMessage_1.TrySendAutoRemoveMessage)(serverID, serverInfo.Channel, {
            content: (0, discord_js_1.userMention)(userID)
        });
    }
    (0, DropPack_1.DropPack)(serverInfo, {
        pack: pack,
        title: title ?? embedTitle,
        userId: userID,
        ignoreCooldown: ignoreCooldown
    });
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Pack succesfully sent`)
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
});
