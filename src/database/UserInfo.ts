import { doc, DocumentData, Firestore, getDoc, Timestamp } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";

export class UserInfo extends DatabaseElement {
    ServerId: string;
    LastTimeOpened: Timestamp | undefined;
    AssembledPigs: string[];

    constructor(id: string, serverId: string, assembledPigs: string[], lastTimeOpened?: Timestamp) {
        super(id);
        this.ServerId = serverId;
        this.AssembledPigs = assembledPigs;
        this.LastTimeOpened = lastTimeOpened;
    }

    GetData(): object {
        if (this.LastTimeOpened === undefined) {
            return {
                AssembledPigs: this.AssembledPigs
            };
        } else {
            return {
                LastTimeOpened: this.LastTimeOpened,
                AssembledPigs: this.AssembledPigs
            };
        }
    }
}


const CachedUserInfosPerServer: { [key: string]: DatabaseElementList<UserInfo> } = {};


function CreateUserInfoFromData(id: string, serverId: string, userInfoData: DocumentData): UserInfo{
    const newUserInfo = new UserInfo(
        id,
        serverId,
        userInfoData.AssembledPigs,
        userInfoData.LastTimeOpened
    );

    return newUserInfo;
}


function GetUserInfoCacheForServer(serverId: string): DatabaseElementList<UserInfo>{
    let userInfoCacheForServer = CachedUserInfosPerServer[serverId];

    if(userInfoCacheForServer === undefined){
        CachedUserInfosPerServer[serverId] = new DatabaseElementList<UserInfo>();
        userInfoCacheForServer = CachedUserInfosPerServer[serverId];
    }

    return userInfoCacheForServer;
}


function GetUserInfoFromCache(serverId: string, userId: string): UserInfo | undefined{
    let cachedUserInfos = GetUserInfoCacheForServer(serverId);
    return cachedUserInfos.Get(userId);
}


export async function AddUserInfoToCache(msgInfo: UserInfo, db: Firestore){
    let cachedMessageInfos = GetUserInfoCacheForServer(msgInfo.ServerId);
    await cachedMessageInfos.Add(msgInfo, db);
}


export async function AddUserInfosToCache(packs: UserInfo[], db: Firestore){
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddUserInfoToCache(pack, db);
    }
}


export async function GetUserInfo(serverId: string, userId: string, db: Firestore){
    const cachedServerInfo = GetUserInfoFromCache(serverId, userId);

    if(cachedServerInfo === undefined){
        const userInfoDocument = doc(db, `serverInfo/${serverId}/users/${userId}`);
        const foundUserInfo = await getDoc(userInfoDocument);

        if(foundUserInfo.exists()){
            const userInfoData = foundUserInfo.data();
            const newuserInfo = CreateUserInfoFromData(userId, serverId, userInfoData);
            AddUserInfoToCache(newuserInfo, db);

            return newuserInfo;
        }else{
            return undefined;
        }
    }else{
        return cachedServerInfo;
    }
}