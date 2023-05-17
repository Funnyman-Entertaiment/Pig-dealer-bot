import { query, collection, getDocs, writeBatch, DocumentData, QueryDocumentSnapshot } from "firebase/firestore/lite";
import { db } from "../Bot";
import { LogInfo } from "../Utils/Log";

async function ResetServerUsers(){
    LogInfo("Resetting server and user information.")

    const serverGroups: QueryDocumentSnapshot<DocumentData>[][] = [];
    serverGroups.push([]);

    const serverQuery = query(collection(db, "serverInfo"));
    const servers = await getDocs(serverQuery);

    servers.forEach(server => {
        if(serverGroups[serverGroups.length-1].length >= 400){
            serverGroups.push([]);
        }

        serverGroups[serverGroups.length-1].push(server);
    });

    for (let i = 0; i < serverGroups.length; i++) {
        const batch = writeBatch(db);
        const serverDocs = serverGroups[i];

        serverDocs.forEach(element => {
            batch.update(element.ref, {
                Enabled: true
            });
        });

        await batch.commit();
    }

    const userGroups: QueryDocumentSnapshot<DocumentData>[][] = [];
    userGroups.push([]);

    const usersQuery = query(collection(db, "users"));
    const users = await getDocs(usersQuery);

    users.forEach(server => {
        if(userGroups[userGroups.length-1].length >= 400){
            userGroups.push([]);
        }

        userGroups[userGroups.length-1].push(server);
    });

    for (let i = 0; i < userGroups.length; i++) {
        const batch = writeBatch(db);
        const userDocs = userGroups[i];

        userDocs.forEach(element => {
            batch.update(element.ref, {
                WarnedAboutCooldown: false
            });
        });

        await batch.commit();
    }
}

export async function ResetServerAndUserInfo() {
    await ResetServerUsers();

    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}