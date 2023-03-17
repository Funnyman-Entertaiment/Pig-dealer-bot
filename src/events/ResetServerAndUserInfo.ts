import { query, collection, getDocs } from "firebase/firestore/lite";
import { db } from "../Bot";
import { AddServerInfoToCache, GetServerInfo, SaveAllServerInfo } from "../database/ServerInfo";
import { AddUserInfoToCache, GetUserInfo, SaveAllUserInfo } from "../database/UserInfo";
import { LogInfo } from "../Utils/Log";

async function ResetServerUsers(){
    LogInfo("Resetting server and user information.")

    const serverQuery = query(collection(db, "serverInfo"));
    const servers = await getDocs(serverQuery);

    for (let i = 0; i < servers.size; i++) {
        const element = servers.docs[i];

        const serverInfo = await GetServerInfo(element.id);
        console.log(`Server: ${i+1}/${servers.size} (${element.id})`);
        await new Promise(r => setTimeout(r, 200));
        if(serverInfo !== undefined){
            serverInfo.Enabled = true;
            await AddServerInfoToCache(serverInfo);
        }
    }

    SaveAllServerInfo();

    const usersQuery = query(collection(db, "users"));
    const users = await getDocs(usersQuery);

    for (let i = 0; i < users.size; i++) {
        const element = users.docs[i];
        
        const userInfo = await GetUserInfo(element.id);
        console.log(`User: ${i+1}/${users.size} (${element.id})`);
        await new Promise(r => setTimeout(r, 200));
        if(userInfo !== undefined){
            userInfo.WarnedAboutCooldown = false;
            await AddUserInfoToCache(userInfo);
        }
    }

    SaveAllUserInfo();
}

export async function ResetServerAndUserInfo() {
    await ResetServerUsers();

    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}