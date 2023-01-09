"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GivePig = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const ServerInfo_1 = require("../database/ServerInfo");
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const Errors_1 = require("../Utils/Errors");
const SendMessage_1 = require("../Utils/SendMessage");
const Log_1 = require("../Utils/Log");
const Pigs_1 = require("../database/Pigs");
const PigRenderer_1 = require("../Utils/PigRenderer");
const UserInfo_1 = require("../database/UserInfo");
const AssemblyyPigs_1 = require("../Utils/AssemblyyPigs");
exports.GivePig = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("givepig")
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("pig")
    .setDescription("ID of the pig to give.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("user")
    .setDescription("ID of the user that will receive the pig.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("server")
    .setDescription("Server id to send the pig in.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("title")
    .setDescription("Title of the given pig embed."))
    .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
    .setName("sendembed")
    .setDescription("Whether or not to send a message. Defaults to sending."))
    .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
    .setName("ping")
    .setDescription("Whether or not to ping the user. Defaults to not pinging."))
    .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"), async (interaction) => {
    await interaction.deferReply();
    const options = interaction.options;
    const pigID = options.getString("pig");
    if (pigID === null) {
        return;
    }
    const pig = (0, Pigs_1.GetPig)(pigID);
    if (pig === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Pig not found`, `PigID: ${pigID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    const title = options.getString("title");
    const ping = options.getBoolean("ping") ?? false;
    const sendEmbed = options.getBoolean("sendembed") ?? true;
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
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't find the user in that server`, `Server: ${(0, Log_1.PrintServer)(server)}`, `UserID: ${userID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    if (user === undefined) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`Couldn't find the user in that server`, `Server: ${(0, Log_1.PrintServer)(server)}`, `UserID: ${userID}`);
        interaction.followUp({
            embeds: [errorEmbed]
        });
        return;
    }
    let userInfo = await (0, UserInfo_1.GetUserInfo)(userID);
    if (userInfo === undefined) {
        userInfo = new UserInfo_1.UserInfo(userID, [], {
            [pig.ID]: 1
        }, false);
        (0, UserInfo_1.AddUserInfoToCache)(userInfo);
    }
    else {
        if (userInfo.Pigs[pig.ID] === undefined) {
            userInfo.Pigs[pig.ID] = 1;
        }
        else {
            userInfo.Pigs[pig.ID]++;
        }
    }
    if (ping) {
        await (0, SendMessage_1.TrySendAutoRemoveMessage)(serverID, serverInfo.Channel, {
            content: (0, discord_js_1.userMention)(userID)
        });
    }
    const pigEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(title ?? `${user.user.username} has received a free pig!`);
    const img = (0, PigRenderer_1.AddPigRenderToEmbed)(pigEmbed, {
        pig: pig
    });
    if (sendEmbed) {
        (0, SendMessage_1.TrySendMessageToChannel)(serverID, serverInfo.Channel, {
            embeds: [pigEmbed],
            files: [img]
        });
    }
    (0, AssemblyyPigs_1.CheckAndSendAssemblyPigEmbeds)(serverID, userID, [pig]);
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Pig succesfully sent`)
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
});
