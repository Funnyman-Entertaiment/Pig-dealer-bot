import { query, collection, getDocs, WriteBatch, Firestore, writeBatch } from "firebase/firestore/lite";
import { db } from "../Bot";
import { AddServerInfoToCache, GetServerInfo, SaveAllServerInfo } from "../database/ServerInfo";
import { AddUserInfoToCache, GetUserInfo, SaveAllUserInfo } from "../database/UserInfo";
import { LogInfo } from "../Utils/Log";

async function ResetServerUsers(){
    LogInfo("Resetting server and user information.")

    const batch = writeBatch(db);

    const serverQuery = query(collection(db, "serverInfo"));
    const servers = await getDocs(serverQuery);

    for (let i = 0; i < servers.size; i++) {
        const element = servers.docs[i];
        batch.update(element.ref, {
            Enabled: true
        });
    }

    const usersQuery = query(collection(db, "users"));
    const users = await getDocs(usersQuery);

    for (let i = 0; i < users.size; i++) {
        const element = users.docs[i];
        batch.update(element.ref, {
            WarnedAboutCooldown: true
        });
    }

    await batch.commit();
}

export async function ResetServerAndUserInfo() {
    await ResetServerUsers();

    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}