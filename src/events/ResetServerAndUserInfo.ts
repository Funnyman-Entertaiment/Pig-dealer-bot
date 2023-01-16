import { query, collection, getDocs } from "firebase/firestore/lite";
import { db } from "../Bot";
import { GetServerInfo } from "../database/ServerInfo";
import { GetUserInfo } from "../database/UserInfo";

async function ResetServerUsers(){
    const serverQuery = query(collection(db, "serverInfo"));
    const servers = await getDocs(serverQuery);

    for (let i = 0; i < servers.size; i++) {
        const element = servers.docs[i];

        const serverInfo = await GetServerInfo(element.id);
        if(serverInfo !== undefined){
            serverInfo.Enabled = true;
        }
    }

    const usersQuery = query(collection(db, "users"));
    const users = await getDocs(usersQuery);

    for (let i = 0; i < users.size; i++) {
        const element = users.docs[i];
        
        const userInfo = await GetUserInfo(element.id)
        if(userInfo !== undefined){
            userInfo.WarnedAboutCooldown = false;
        }
    }
}

export async function ResetServerAndUserInfo() {
    await ResetServerUsers();

    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}