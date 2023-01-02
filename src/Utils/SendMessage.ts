import { ChannelType, GuildChannel, MessageCreateOptions } from "discord.js";
import { client } from "../Bot";
import { LogError, LogWarn, PrintChannel, PrintServer } from "./Log";
import { Timestamp } from "firebase/firestore/lite";

export async function TrySendMessageToChannel(serverId: string, channelId: string, message: MessageCreateOptions){
    const server = await client.guilds.fetch(serverId);
    const channel = await server.channels.fetch(channelId);
    const serverBotUser = server.members.me;

    if(serverBotUser === null){
        LogError(`Couldn't find bot user in server ${PrintServer(server)}`)
        return;
    }

    if(channel === undefined || channel === null){
        LogError(`Couldn't find channel ${channelId} in server ${PrintServer(server)}`);
        return;
    }

    if(channel.type !== ChannelType.GuildText){
        LogError(`Channel ${PrintChannel(channel as any as GuildChannel)} is not text based in server ${PrintServer(server)}`);
        return;
    }

    const timeoutedDate = serverBotUser.communicationDisabledUntil;

    if (timeoutedDate !== undefined && timeoutedDate !== null){
        const currentDate = Timestamp.now().toDate();

        if(currentDate < timeoutedDate){
            LogWarn(`Bot is timeouted in ${PrintServer(server)}`);
            return;
        }
    }

    const permissions = serverBotUser.permissionsIn(channel);

    if (!permissions.has("SendMessages") || !permissions.has("ViewChannel")) {
        LogWarn(`Not enough permissions to send messages in ${PrintServer(server)}`);
        return;
    }

    try{
        const msgPromise = channel.send(message);
        return msgPromise;
    } catch (error) {
        LogError(`There was an error sending a message to ${PrintServer(server)} => ${error}`)
        return;
    }
}

export async function TrySendAutoRemoveMessage(serverId: string, channelId: string, message: MessageCreateOptions){
    const msgPromise = TrySendMessageToChannel(serverId, channelId, message);

    if(msgPromise === undefined){ return; }

    msgPromise.then(message =>{
        message?.delete();
    });
}