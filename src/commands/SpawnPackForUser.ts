import { SlashCommandBuilder, SlashCommandStringOption, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, Colors, SlashCommandBooleanOption, userMention, Guild, GuildMember } from "discord.js";
import { Command } from "../Command";
import { CreateServerInfoFromData, GetServerInfo } from "../database/ServerInfo";
import { GetPack } from "../database/Packs";
import { getDoc, doc } from "firebase/firestore/lite";
import { client, db } from "../Bot";
import { DropPack } from "../Utils/DropPack";
import { MakeErrorEmbed } from "../Utils/Errors";
import { TrySendAutoRemoveMessage } from "../Utils/SendMessage";
import { PrintServer } from "../Utils/Log";

export const SpawnPackUser = new Command(
    "",
    "",
    new SlashCommandBuilder()
        .setName("spawnpackuser")
        .addStringOption(new SlashCommandStringOption()
            .setName("pack")
            .setDescription("ID of the pack to spawn.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("user")
            .setDescription("ID of the user that will receive the pack.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("server")
            .setDescription("Server id to send the pack in.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("title")
            .setDescription("Title of the dropped pack embed."))
        .addBooleanOption(new SlashCommandBooleanOption()
            .setName("ping")
            .setDescription("Whether or not to ping the user. Defaults to not pinging."))
        .addBooleanOption(new SlashCommandBooleanOption()
            .setName("ignorecooldown")
            .setDescription("Whether or not users with cooldown will be able to open the pack. Defaults to not ignoring."))
        .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        const options = interaction.options as CommandInteractionOptionResolver

        const packID = options.getString("pack");
        if (packID === null) { return; }
        const pack = GetPack(packID);
        if (pack === undefined) {
            const errorEmbed = MakeErrorEmbed(`Pack not found`, `PackID: ${packID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        const title = options.getString("title");
        const ping = options.getBoolean("ping") ?? false;
        const ignoreCooldown = options.getBoolean("ignorecooldown")?? false;

        const userID = options.getString("user");
        if (userID === null) { return; }

        const serverID = options.getString("server");
        if (serverID === null) { return; }

        let serverInfo = await GetServerInfo(serverID);

        if (serverInfo === undefined) {
            const docRef = doc(db, `serverInfo/${serverID}`);
            const serverDoc = await getDoc(docRef);

            if (serverDoc.exists()) {
                serverInfo = CreateServerInfoFromData(serverDoc.id, serverDoc.data());
            } else {
                const errorEmbed = MakeErrorEmbed(`No server found with that id`, `ID: ${serverID}`);
                interaction.followUp({
                    embeds: [errorEmbed]
                });
                return;
            }
        }

        if (serverInfo.Channel === undefined) {
            const errorEmbed = MakeErrorEmbed(`The server doesn't have a channel set`, `ID: ${serverID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        let server: Guild;
        try{
            server = await client.guilds.fetch(serverID);
        } catch {
            const errorEmbed = MakeErrorEmbed(`The bot doesn't have access to that server`, `ID: ${serverID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        let user: GuildMember;

        try{
            user = await server.members.fetch(userID)
        } catch {
            const errorEmbed = MakeErrorEmbed(`The couldn't find the user in that server`, `Server: ${PrintServer(server)}`, `UserID: ${userID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        if (user === undefined){
            const errorEmbed = MakeErrorEmbed(`The couldn't find the user in that server`, `Server: ${PrintServer(server)}`, `UserID: ${userID}`);
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
            await TrySendAutoRemoveMessage(serverID, serverInfo.Channel, {
                content: userMention(userID)
            })
        }

        DropPack(serverInfo, {
            pack: pack,
            title: title ?? embedTitle,
            userId: userID,
            ignoreCooldown: ignoreCooldown
        });

        const successEmbed = new EmbedBuilder()
            .setTitle(`Pack succesfully sent`)
            .setColor(Colors.Green);
        interaction.followUp({
            embeds: [successEmbed]
        });
    }
);