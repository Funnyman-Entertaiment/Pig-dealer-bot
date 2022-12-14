import { doc, DocumentData, getDoc } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";
import { db } from "../Bot";

export class ServerInfo extends DatabaseElement {
    Channel: string | undefined;
    Role: string | undefined
    HasSpawnedGoldenPig: boolean;
    YearsSpawnedAllNewYearDeco: number[];
    Enabled: boolean;

    constructor(id: string, channel: string | undefined, role: string | undefined, hasSpawnedGoldenPig: boolean, yearsSpawnedAllNewYearDeco: number[], enabled: boolean) {
        super(id);
        this.Channel = channel;
        this.Role = role;
        this.HasSpawnedGoldenPig = hasSpawnedGoldenPig;
        this.YearsSpawnedAllNewYearDeco = yearsSpawnedAllNewYearDeco;
        this.Enabled = enabled;
    }

    GetData(): object {
        const data: {[key: string]: any} = {
            HasSpawnedGoldenPig: this.HasSpawnedGoldenPig,
            YearsSpawnedAllNewYearDeco: this.YearsSpawnedAllNewYearDeco,
            Enabled: this.Enabled
        }

        if(this.Channel !== undefined){
            data.Channel = this.Channel;
        }

        if(this.Role !== undefined){
            data.Role = this.Role;
        }

        return data;
    }
}


let CachedServerInfos: DatabaseElementList<ServerInfo> | undefined;


function GetCachedServerInfos(){
    if(CachedServerInfos === undefined){
        CachedServerInfos = new DatabaseElementList<ServerInfo>();
    }

    return CachedServerInfos;
}


export function SaveAllServerInfo(){
    CachedServerInfos?.SaveAll();
}


export function CreateServerInfoFromData(id: string, serverInfoData: DocumentData): ServerInfo{
    const newPack = new ServerInfo(
        id,
        serverInfoData.Channel,
        serverInfoData.Role,
        serverInfoData.HasSpawnedGoldenPig ?? false,
        serverInfoData.YearsSpawnedAllNewYearDeco ?? [],
        serverInfoData.Enabled ?? true
    )

    return newPack;
}


export async function AddServerInfoToCache(serverInfo: ServerInfo){
    await GetCachedServerInfos().Add(serverInfo);
}


export async function AddServerInfosToCache(packs: ServerInfo[]){
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddServerInfoToCache(pack);
    }
}


export async function GetServerInfo(serverId: string){
    const cachedServerInfo = GetCachedServerInfos().Get(serverId);

    if(cachedServerInfo === undefined){
        const packDocument = doc(db, `serverInfo/${serverId}`);
        const foundServerInfo = await getDoc(packDocument);

        if(foundServerInfo.exists()){
            const serverInfoData = foundServerInfo.data();
            const newServerInfo = CreateServerInfoFromData(serverId, serverInfoData);
            AddServerInfoToCache(newServerInfo);

            return newServerInfo;
        }else{
            return undefined;
        }
    }else{
        return cachedServerInfo;
    }
}