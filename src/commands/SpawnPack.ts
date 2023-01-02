import { SlashCommandBuilder, SlashCommandStringOption, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, Colors, SlashCommandBooleanOption } from "discord.js";
import { Command } from "../Command";
import { CreateServerInfoFromData, GetServerInfo, ServerInfo } from "../database/ServerInfo";
import { GetPack } from "../database/Packs";
import { query, collection, getDocs, getDoc, doc } from "firebase/firestore/lite";
import { db } from "../Bot";
import { DropPack } from "../Utils/DropPack";
import { MakeErrorEmbed } from "../Utils/Errors";

export const SpawnPack = new Command(
    new SlashCommandBuilder()
    .setName("spawnpack")
    .addStringOption(new SlashCommandStringOption()
        .setName("pack")
        .setDescription("ID of the pack to spawn.")
        .setRequired(true))
    .addStringOption(new SlashCommandStringOption()
        .setName("servers")
        .setDescription("Server ids (separated with commas) to send the pack in."))
    .addStringOption(new SlashCommandStringOption()
        .setName("title")
        .setDescription("Title of the dropped pack embed. If no title is specified, it'll use the default pack drop title."))
    .addBooleanOption(new SlashCommandBooleanOption()
        .setName("ping")
        .setDescription("Whether or not to ping the collector role of the server. Defaults to pinging."))
    .addBooleanOption(new SlashCommandBooleanOption()
        .setName("ignorecooldown")
        .setDescription("Whether or not users with cooldown will be able to open the pack. Defaults to not ignoring."))
    .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        const options = interaction.options as CommandInteractionOptionResolver

        const packID = options.getString("pack");
        if(packID === null){ return; }
        const pack = GetPack(packID);
        if(pack === undefined){
            const errorEmbed = MakeErrorEmbed(`Pack not found`, `PackID: ${packID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        const title = options.getString("title");
        const ping = options.getBoolean("ping")?? true;
        const ignoreCooldown = options.getBoolean("ignorecooldown")?? false;

        const serverIDs = options.getString("servers")?.split(",").map(s => s.trim());
        const serverInfos: ServerInfo[] = [];

        if(serverIDs === undefined){
            const q = query(collection(db, "serverInfo"));
            const serverDocs = await getDocs(q);

            serverDocs.forEach(serverInfoDoc => {
                const serverInfo = CreateServerInfoFromData(serverInfoDoc.id, serverInfoDoc.data());
                serverInfos.push(serverInfo);
            });
        }else{
            for (let i = 0; i < serverIDs.length; i++) {
                const serverID = serverIDs[i];
                const serverInfo = await GetServerInfo(serverID);

                if(serverInfo === undefined){
                    const docRef = doc(db, `serverInfo/${serverID}`);
                    const serverDoc = await getDoc(docRef);

                    if(serverDoc.exists()){
                        const newServerInfo = CreateServerInfoFromData(serverDoc.id, serverDoc.data());
                        serverInfos.push(newServerInfo);
                    }
                }else{
                    serverInfos.push(serverInfo);
                }
            }
        }

        if(serverInfos.length === 0){
            const errorEmbed = MakeErrorEmbed(`No servers found for those ids`);
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
            DropPack(serverInfo, {
                pack: pack,
                title: title?? embedTitle,
                ping: ping,
                ignoreCooldown: ignoreCooldown
            });
        });

        const successEmbed = new EmbedBuilder()
            .setTitle(`Pack${serverInfos.length > 1? "s":""} succesfully sent`)
            .setColor(Colors.Green);
        interaction.followUp({
            embeds: [successEmbed]
        });
    }
);