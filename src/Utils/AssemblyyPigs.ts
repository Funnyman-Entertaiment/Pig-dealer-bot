import { GetUserInfo, UserInfo } from "../database/UserInfo";
import { client } from "../Bot";
import { GetPigsByRarity, Pig } from "../database/Pigs";
import { GetServerInfo, ServerInfo } from "../database/ServerInfo";
import { EmbedBuilder } from "discord.js";
import { AddPigRenderToEmbed } from "./PigRenderer";
import { TrySendMessageToChannel } from "./SendMessage";

function GetPossibleAssemblyPigs(userInfo: UserInfo): Pig[]{
    const allAssemblyPigs = GetPigsByRarity("Assembly");
    return allAssemblyPigs.filter(pig => !userInfo.AssembledPigs.includes(pig.ID));
}

function GetUserPigIDs(userInfo: UserInfo, newPigs: Pig[]): string[]{
    const userPigs: string[] = [];
    for (const key in userInfo.Pigs) {
        userPigs.push(key);
    }
    newPigs.filter(pig => !userPigs.includes(pig.ID)).forEach(pig => userPigs.push(pig.ID));

    return userPigs;
}

function GetCompletedPigs(possibleAssemblyPigs: Pig[], userPigIds: string[]): Pig[]{
    const completedPigs: Pig[] = [];
    let previousCompletedPigsNum = completedPigs.length;

    do {
        previousCompletedPigsNum = completedPigs.length;

        possibleAssemblyPigs.filter(assemblyPig => {
            const requiredPigs = assemblyPig.RequiredPigs;

            return requiredPigs.every(requiredPig => userPigIds.includes(requiredPig));
        }).forEach(assemblyPig => {
            completedPigs.push(assemblyPig);
            userPigIds.push(assemblyPig.ID);
        });

        possibleAssemblyPigs = possibleAssemblyPigs.filter(pig => !completedPigs.includes(pig));
    } while (previousCompletedPigsNum !== completedPigs.length);

    return completedPigs;
}

async function SendAssemblyPigEmbed(serverInfo: ServerInfo, userInfo: UserInfo, completedPig: Pig){
    if (serverInfo.Channel === undefined) { return; }

    const user = await client.users.fetch(userInfo.ID);

    const assemblyPigEmbed = new EmbedBuilder()
            .setTitle(`You've completed a set and obtained a bonus pig!`)
            .setAuthor({
                name: user.username,
                iconURL: user.avatarURL()?? undefined //I hate javascript
            });
    

    const imgPath = AddPigRenderToEmbed(assemblyPigEmbed, {
        pig: completedPig,
        new: true
    });

    TrySendMessageToChannel(serverInfo.ID, serverInfo.Channel, {
        embeds: [assemblyPigEmbed],
        files: [imgPath]
    });
}

export async function CheckAndSendAssemblyPigEmbeds(serverId: string, userId: string, newPigs: Pig[]) {
    const serverInfo = await GetServerInfo(serverId);
    if (serverInfo === undefined) { return; }
    if (serverInfo.Channel === undefined) { return; }
    const userInfo = await GetUserInfo(userId);
    if (userInfo === undefined) { return; }

    const possibleAssemblyPigs = GetPossibleAssemblyPigs(userInfo);
    const userPigIDs = GetUserPigIDs(userInfo, newPigs);

    const completedPigs = GetCompletedPigs(possibleAssemblyPigs, userPigIDs);

    completedPigs.forEach(pig => {
        if(userInfo.Pigs[pig.ID] === undefined){
            userInfo.Pigs[pig.ID] = 1;
        }else{
            userInfo.Pigs[pig.ID]++;
        }
        userInfo.AssembledPigs.push(pig.ID);

        SendAssemblyPigEmbed(serverInfo, userInfo, pig);
    });

    return completedPigs;
}