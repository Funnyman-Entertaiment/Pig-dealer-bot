import { Guild, GuildChannel, User } from "discord.js";

export function LogInfo(msg: string){
    console.log(`[INFO] ${msg}`);
}


export function LogWarn(msg:string){
    console.log(`[WARN] ${msg}`);
}


export function LogError(msg:string){
    console.log(`[ERROR] ${msg}`);
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