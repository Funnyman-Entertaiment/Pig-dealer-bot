import { SlashCommandBuilder, SlashCommandStringOption, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, Colors, SlashCommandBooleanOption, userMention, Guild, GuildMember } from "discord.js";
import { Command } from "../Command";
import { CreateServerInfoFromData, GetServerInfo } from "../database/ServerInfo";
import { getDoc, doc } from "firebase/firestore/lite";
import { client, db } from "../Bot";
import { MakeErrorEmbed } from "../Utils/Errors";
import { TrySendAutoRemoveMessage, TrySendMessageToChannel } from "../Utils/SendMessage";
import { PrintServer } from "../Utils/Log";
import { GetPig } from "../database/Pigs";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { AddUserInfoToCache, GetUserInfo, UserInfo } from "../database/UserInfo";
import { CheckAndSendAssemblyPigEmbeds } from "../Utils/AssemblyyPigs";

export const GivePig = new Command(
    new SlashCommandBuilder()
        .setName("givepig")
        .addStringOption(new SlashCommandStringOption()
            .setName("pig")
            .setDescription("ID of the pig to give.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("user")
            .setDescription("ID of the user that will receive the pig.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("server")
            .setDescription("Server id to send the pig in.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("title")
            .setDescription("Title of the given pig embed."))
        .addBooleanOption(new SlashCommandBooleanOption()
            .setName("sendembed")
            .setDescription("Whether or not to send a message. Defaults to sending."))
        .addBooleanOption(new SlashCommandBooleanOption()
            .setName("ping")
            .setDescription("Whether or not to ping the user. Defaults to not pinging."))
        .setDescription("Sends a message to the devs to report bugs or telling them how awesome the bot is"),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        const options = interaction.options as CommandInteractionOptionResolver

        const pigID = options.getString("pig");
        if (pigID === null) { return; }
        const pig = GetPig(pigID);
        if (pig === undefined) {
            const errorEmbed = MakeErrorEmbed(`Pig not found`, `PigID: ${pigID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        const title = options.getString("title");
        const ping = options.getBoolean("ping") ?? false;
        const sendEmbed = options.getBoolean("sendembed") ?? true;

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
            const errorEmbed = MakeErrorEmbed(`Couldn't find the user in that server`, `Server: ${PrintServer(server)}`, `UserID: ${userID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        if (user === undefined){
            const errorEmbed = MakeErrorEmbed(`Couldn't find the user in that server`, `Server: ${PrintServer(server)}`, `UserID: ${userID}`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        let userInfo = await GetUserInfo(userID);

        if(userInfo === undefined){
            userInfo = new UserInfo(
                userID,
                [],
                {
                    [pig.ID]: 1
                }
            );
            AddUserInfoToCache(userInfo);
        }else{
            if(userInfo.Pigs[pig.ID] === undefined){
                userInfo.Pigs[pig.ID] = 1;
            }else{
                userInfo.Pigs[pig.ID]++;
            }
        }
        
        if (ping) {
            await TrySendAutoRemoveMessage(serverID, serverInfo.Channel, {
                content: userMention(userID)
            })
        }

        const pigEmbed = new EmbedBuilder()
            .setTitle(title?? `${user.user.username} has received a free pig!`);

        const img = AddPigRenderToEmbed(pigEmbed, {
            pig: pig
        });

        if(sendEmbed){
            TrySendMessageToChannel(serverID, serverInfo.Channel, {
                embeds: [pigEmbed],
                files: [img]
            });
        }

        CheckAndSendAssemblyPigEmbeds(serverID, userID, [pig]);

        const successEmbed = new EmbedBuilder()
            .setTitle(`Pig succesfully sent`)
            .setColor(Colors.Green);
        interaction.followUp({
            embeds: [successEmbed]
        });
    }
);