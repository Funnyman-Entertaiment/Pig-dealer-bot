import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";
import { db } from "../Bot";

export class UserInfo extends DatabaseElement {
    LastTimeOpened: Timestamp | undefined;
    AssembledPigs: string[];
    Pigs: {[key: string]: number};

    constructor(id: string, assembledPigs: string[], pigs: {[key: string]: number}, lastTimeOpened?: Timestamp) {
        super(id);
        this.AssembledPigs = assembledPigs;
        this.Pigs = pigs;
        this.LastTimeOpened = lastTimeOpened;
    }

    GetData(): object {
        if (this.LastTimeOpened === undefined) {
            return {
                AssembledPigs: this.AssembledPigs,
                Pigs: this.Pigs
            };
        } else {
            return {
                LastTimeOpened: this.LastTimeOpened,
                AssembledPigs: this.AssembledPigs,
                Pigs: this.Pigs
            };
        }
    }
}


let CachedUserInfos: DatabaseElementList<UserInfo> | undefined;


export async function SaveAllUserInfo(){
    await CachedUserInfos?.SaveAll();
}


function CreateUserInfoFromData(id: string, userInfoData: DocumentData): UserInfo{
    const newUserInfo = new UserInfo(
        id,
        userInfoData.AssembledPigs?? [],
        userInfoData.Pigs?? {},
        userInfoData.LastTimeOpened
    );

    return newUserInfo;
}


function GetCachedUserInfos(){
    if(CachedUserInfos === undefined){
        CachedUserInfos = new DatabaseElementList<UserInfo>();
    }

    return CachedUserInfos;
}


export async function AddUserInfoToCache(userInfo: UserInfo){
    await GetCachedUserInfos().Add(userInfo);
}


export async function AddUserInfosToCache(packs: UserInfo[]){
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddUserInfoToCache(pack);
    }
}


export async function GetUserInfo(userId: string){
    const cachedUserInfo = GetCachedUserInfos().Get(userId);

    if(cachedUserInfo === undefined){
        const userInfoDocument = doc(db, `users/${userId}`);
        const foundUserInfo = await getDoc(userInfoDocument);

        if(foundUserInfo.exists()){
            const userInfoData = foundUserInfo.data();
            const newuserInfo = CreateUserInfoFromData(userId, userInfoData);
            AddUserInfoToCache(newuserInfo);

            return newuserInfo;
        }else{
            return undefined;
        }
    }else{
        return cachedUserInfo;
    }
}