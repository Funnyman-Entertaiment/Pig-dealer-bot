"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpawnPack = void 0;
const discord_js_1 = require("discord.js");
const Command_1 = require("../Command");
const ServerInfo_1 = require("../database/ServerInfo");
const Packs_1 = require("../database/Packs");
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const DropPack_1 = require("../Utils/DropPack");
const Errors_1 = require("../Utils/Errors");
exports.SpawnPack = new Command_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("spawnpack")
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("pack")
    .setDescription("ID of the pack to spawn.")
    .setRequired(true))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("servers")
    .setDescription("Server ids (separated with commas) to send the pack in."))
    .addStringOption(new discord_js_1.SlashCommandStringOption()
    .setName("title")
    .setDescription("Title of the dropped pack embed. If no title is specified, it'll use the default pack drop title."))
    .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
    .setName("ping")
    .setDescription("Whether or not to ping the collector role of the server. Defaults to pinging."))
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
    const ping = options.getBoolean("ping") ?? true;
    const ignoreCooldown = options.getBoolean("ignorecooldown") ?? false;
    const serverIDs = options.getString("servers")?.split(",").map(s => s.trim());
    const serverInfos = [];
    if (serverIDs === undefined) {
        const q = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
        const serverDocs = await (0, lite_1.getDocs)(q);
        serverDocs.forEach(serverInfoDoc => {
            const serverInfo = (0, ServerInfo_1.CreateServerInfoFromData)(serverInfoDoc.id, serverInfoDoc.data());
            serverInfos.push(serverInfo);
        });
    }
    else {
        for (let i = 0; i < serverIDs.length; i++) {
            const serverID = serverIDs[i];
            const serverInfo = await (0, ServerInfo_1.GetServerInfo)(serverID);
            if (serverInfo === undefined) {
                const docRef = (0, lite_1.doc)(Bot_1.db, `serverInfo/${serverID}`);
                const serverDoc = await (0, lite_1.getDoc)(docRef);
                if (serverDoc.exists()) {
                    const newServerInfo = (0, ServerInfo_1.CreateServerInfoFromData)(serverDoc.id, serverDoc.data());
                    serverInfos.push(newServerInfo);
                }
            }
            else {
                serverInfos.push(serverInfo);
            }
        }
    }
    if (serverInfos.length === 0) {
        const errorEmbed = (0, Errors_1.MakeErrorEmbed)(`No servers found for those ids`);
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
    serverInfos.forEach(serverInfo => {
        (0, DropPack_1.DropPack)(serverInfo, {
            pack: pack,
            title: title ?? embedTitle,
            ping: ping,
            ignoreCooldown: ignoreCooldown
        });
    });
    const successEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Pack${serverInfos.length > 1 ? "s" : ""} succesfully sent`)
        .setColor(discord_js_1.Colors.Green);
    interaction.followUp({
        embeds: [successEmbed]
    });
});
