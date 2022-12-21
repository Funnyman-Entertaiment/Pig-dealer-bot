import { doc, DocumentData, Firestore, getDoc } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";

type MessageType = "RandomPack" | "PigGallery"

export class MessageInfo extends DatabaseElement {
    ServerId: string;
    Type: MessageType;
    User: string | undefined;

    constructor(id: string, serverId: string, type: MessageType, user?: string) {
        super(id);
        this.ServerId = serverId;
        this.Type = type;
        this.User = user;
    }
}


export class RandomPackMessage extends MessageInfo {
    Name: string;
    PigCount: number;
    Set: string;
    Tags: string[];
    Opened: boolean;

    constructor(id: string, serverId: string, name: string, pigCount: number, set: string, tags: string[], opened: boolean, user?: string){
        super(id, serverId, "RandomPack", user);
        this.Name = name;
        this.PigCount = pigCount,
        this.Set = set;
        this.Tags = tags;
        this.Opened = opened;
    }

    GetData(): object {
        if(this.User === undefined){
            return {
                Type: this.Type,
                Name: this.Name,
                PigCount: this.PigCount,
                Set: this.Set,
                Tags: this.Tags,
                Opened: this.Opened
            };
        }else{
            return {
                Type: this.Type,
                User: this.User,
                Name: this.Name,
                PigCount: this.PigCount,
                Set: this.Set,
                Tags: this.Tags,
                Opened: this.Opened
            };
        }
    }
}


export class PigGalleryMessage extends MessageInfo {
    CurrentPig: number;
    Pigs: string[];
    NewPigs: string[];

    constructor(id: string, serverId: string, currentPig: number, pigs: string[], newPigs: string[], user?: string) {
        super(id, serverId, "PigGallery", user);
        this.CurrentPig = currentPig;
        this.Pigs = pigs;
        this.NewPigs = newPigs;
    }

    GetData(): object {
        if(this.User === undefined){
            return {
                Type: this.Type,
                CurrentPig: this.CurrentPig,
                Pigs: this.Pigs,
                NewPigs: this.NewPigs
            };
        }else{
            return {
                Type: this.Type,
                User: this.User,
                CurrentPig: this.CurrentPig,
                Pigs: this.Pigs,
                NewPigs: this.NewPigs
            };
        }
    }
}


const CachedMessageInfosPerServer: { [key: string]: DatabaseElementList<MessageInfo> } = {};


export function CreateMessageInfoFromData(id: string, serverId: string, msgInfoData: DocumentData): MessageInfo{
    const msgType = msgInfoData.Type as MessageType;

    if(msgType == "RandomPack"){
        const newRandomPackMsg = new RandomPackMessage(
            id,
            serverId,
            msgInfoData.Name,
            msgInfoData.PigCount,
            msgInfoData.Set,
            msgInfoData.Tags,
            msgInfoData.Opened,
            msgInfoData.User
        );

        return newRandomPackMsg;
    }else{
        const newPigGalleryMsg = new PigGalleryMessage(
            id,
            serverId,
            msgInfoData.CurrentPig,
            msgInfoData.Pigs,
            msgInfoData.NewPigs,
            msgInfoData.User
        );

        return newPigGalleryMsg;
    }
}


export function GetMsgInfoCacheForServer(serverId: string): DatabaseElementList<MessageInfo>{
    let msgInfoCacheForServer = CachedMessageInfosPerServer[serverId];

    if(msgInfoCacheForServer === undefined){
        CachedMessageInfosPerServer[serverId] = new DatabaseElementList<MessageInfo>();
        msgInfoCacheForServer = CachedMessageInfosPerServer[serverId];
    }

    return msgInfoCacheForServer;
}


export function GetMessageInfoFromCache(serverId: string, msgId: string): MessageInfo | undefined{
    let cachedMessageInfos = GetMsgInfoCacheForServer(serverId);
    const found = cachedMessageInfos.Get(msgId);

    return found;
}


export async function AddMessageInfoToCache(msgInfo: MessageInfo, db: Firestore){
    let cachedMessageInfos = GetMsgInfoCacheForServer(msgInfo.ServerId);
    await cachedMessageInfos.Add(msgInfo, db);
}


export async function AddMessageInfosToCache(packs: MessageInfo[], db: Firestore){
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddMessageInfoToCache(pack, db);
    }
}


export async function GetMessageInfo(serverId: string, msgId: string, db: Firestore){
    const cachedMsgInfo = GetMessageInfoFromCache(serverId, msgId);

    if(cachedMsgInfo === undefined){
        const msgInfoDocument = doc(db, `serverInfo/${serverId}/messages/${msgId}`);
        const foundMsgInfo = await getDoc(msgInfoDocument);

        if(foundMsgInfo.exists()){
            const serverInfoData = foundMsgInfo.data();
            const newServerInfo = CreateMessageInfoFromData(msgId, serverId, serverInfoData);
            AddMessageInfoToCache(newServerInfo, db);

            return newServerInfo;
        }else{
            return undefined;
        }
    }else{
        return cachedMsgInfo;
    }
}