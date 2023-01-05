import { Guild, GuildChannel, User } from "discord.js";
import { DevSpace } from "../Constants/Variables";
import { client } from "../Bot";

function SendLogMessage(msg: string){
    console.log(msg);
    if(client.user !== null && client.user.id !== "1048616940194767009"){
        DevSpace.LogChannel.send(msg);
    }
}

export function LogInfo(msg: string){
    SendLogMessage(`[INFO] ${msg}`);
}


export function LogWarn(msg:string){
    SendLogMessage(`[WARN] ${msg}`);
}


export function LogError(msg:string){
    SendLogMessage(`[ERROR] ${msg}`);
}


export function PrintServer(server: Guild): string{
    return `${server.id} [${server.name}]`
}

export function PrintChannel(channel: GuildChannel | undefined | null): string{
    if(channel === undefined || channel === null){ return "- [-]"; }
    return `${channel.id} [${channel.name}]`
}

export function PrintUser(user: User): string{
    return `${user.id} [${user.username}]`
}