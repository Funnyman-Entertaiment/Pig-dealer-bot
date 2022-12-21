import { doc, DocumentData, Firestore, getDoc } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";

export class ServerInfo extends DatabaseElement {
    Channel: string | undefined;
    Role: string | undefined
    HasSpawnedGoldenPig: boolean;

    constructor(id: string, channel: string | undefined, role: string | undefined, hasSpawnedGoldenPig: boolean) {
        super(id);
        this.Channel = channel;
        this.Role = role;
        this.HasSpawnedGoldenPig = hasSpawnedGoldenPig;
    }

    GetData(): object {
        return {
            Channel: this.Channel,
            Role: this.Role,
            HasSpawnedGoldenPig: this.HasSpawnedGoldenPig,
        }
    }
}


let CachedServerInfos: DatabaseElementList<ServerInfo> | undefined;


function GetCachedServerInfos(){
    if(CachedServerInfos === undefined){
        CachedServerInfos = new DatabaseElementList<ServerInfo>();
    }

    return CachedServerInfos;
}


export function CreateServerInfoFromData(id: string, serverInfoData: DocumentData): ServerInfo{
    const newPack = new ServerInfo(
        id,
        serverInfoData.Channel,
        serverInfoData.Role,
        serverInfoData.HasSpawnedGoldenPig ?? false
    )

    return newPack;
}


export async function AddServerInfoToCache(serverInfo: ServerInfo, db: Firestore){
    await GetCachedServerInfos().Add(serverInfo, db);
}


export async function AddServerInfosToCache(packs: ServerInfo[], db: Firestore){
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddServerInfoToCache(pack, db);
    }
}


export async function GetServerInfo(serverId: string, db: Firestore){
    const cachedServerInfo = GetCachedServerInfos().Get(serverId);

    if(cachedServerInfo === undefined){
        const packDocument = doc(db, `serverInfo/${serverId}`);
        const foundServerInfo = await getDoc(packDocument);

        if(foundServerInfo.exists()){
            const serverInfoData = foundServerInfo.data();
            const newServerInfo = CreateServerInfoFromData(serverId, serverInfoData);
            AddServerInfoToCache(newServerInfo, db);

            return newServerInfo;
        }else{
            return undefined;
        }
    }else{
        return cachedServerInfo;
    }
}