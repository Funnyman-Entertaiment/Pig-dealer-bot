import { Timestamp } from "firebase/firestore/lite";
import { DatabaseElement } from "./DatabaseElement";

export type MessageType = "RandomPack" | "PigGallery" | "PigList" | "PigTrade"

export class MessageInfo extends DatabaseElement {
    ServerId: string;
    Type: MessageType;
    User: string | undefined;
    TimeSent: Timestamp;

    constructor(id: string, serverId: string, type: MessageType, user?: string, timeSent?: Timestamp) {
        super(id);
        this.ServerId = serverId;
        this.Type = type;
        this.User = user;
        this.TimeSent = timeSent ?? Timestamp.now();
    }
}


export class RandomPackMessage extends MessageInfo {
    Pack: string;
    Opened: boolean;
    IgnoreCooldown: boolean;

    constructor(id: string, serverId: string, pack: string, opened: boolean, ignoreCooldown: boolean, user?: string, timeSent?: Timestamp) {
        super(id, serverId, "RandomPack", user, timeSent);
        this.Pack = pack;
        this.Opened = opened;
        this.IgnoreCooldown = ignoreCooldown;
    }

    GetData(): object {
        if (this.User === undefined) {
            return {
                Type: this.Type,
                Opened: this.Opened,
                Pack: this.Pack
            };
        } else {
            return {
                Type: this.Type,
                User: this.User,
                Opened: this.Opened,
                Pack: this.Pack
            };
        }
    }
}


export class PigGalleryMessage extends MessageInfo {
    CurrentPig: number;
    Pigs: string[];
    NewPigs: string[];
    SeenPigs: number[];

    constructor(id: string, serverId: string, currentPig: number, pigs: string[], newPigs: string[], seenPigs: number[], user?: string, timeSent?: Timestamp) {
        super(id, serverId, "PigGallery", user, timeSent);
        this.CurrentPig = currentPig;
        this.Pigs = pigs;
        this.NewPigs = newPigs;
        this.SeenPigs = seenPigs;
    }

    GetData(): object {
        if (this.User === undefined) {
            return {
                Type: this.Type,
                CurrentPig: this.CurrentPig,
                Pigs: this.Pigs,
                NewPigs: this.NewPigs
            };
        } else {
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


export class PigListMessage extends MessageInfo {
    PigsBySet: { [key: string]: string[] };
    CurrentSet: string;
    CurrentPage: number;

    constructor(id: string, serverId: string, pigsBySet: { [key: string]: string[] }, currentSet: string, currentPage: number, user?: string, timeSent?: Timestamp) {
        super(id, serverId, "PigList", user, timeSent);
        this.PigsBySet = pigsBySet;
        this.CurrentSet = currentSet;
        this.CurrentPage = currentPage;
    }
}


export class PigTradeMessage extends MessageInfo {
    TradeStarterID: string;
    TradeReceiverID: string;

    TradeStarterOffer: { [key: string]: number };
    TradeReceiverOffer: { [key: string]: number };

    ChannelSentID: string;

    constructor(id: string, serverId: string, tradeStarterId: string, tradeReceiverId: string, tradeStarterOffer: { [key: string]: number }, tradeReceiverOffer: { [key: string]: number }, channelSentID: string) {
        super(id, serverId, "PigTrade", tradeReceiverId);
        this.TradeStarterID = tradeStarterId;
        this.TradeReceiverID = tradeReceiverId;

        this.TradeStarterOffer = tradeStarterOffer;
        this.TradeReceiverOffer = tradeReceiverOffer;
        this.ChannelSentID = channelSentID;
    }
}


export const CachedMessageInfosPerServer: { [key: string]: MessageInfo[] } = {};


export function GetMsgInfoCacheForServer(serverId: string): MessageInfo[] {
    let msgInfoCacheForServer = CachedMessageInfosPerServer[serverId];

    if (msgInfoCacheForServer === undefined) {
        CachedMessageInfosPerServer[serverId] = [];
        msgInfoCacheForServer = CachedMessageInfosPerServer[serverId];
    }

    return msgInfoCacheForServer;
}


export function GetMessageInfoFromCache(serverId: string, msgId: string): MessageInfo | undefined {
    let cachedMessageInfos = GetMsgInfoCacheForServer(serverId);
    const found = cachedMessageInfos.find(msg => msg.ID === msgId);

    return found;
}


export function AddMessageInfoToCache(msgInfo: MessageInfo) {
    let cachedMessageInfos = GetMsgInfoCacheForServer(msgInfo.ServerId);
    cachedMessageInfos.push(msgInfo);
}


export function AddMessageInfosToCache(packs: MessageInfo[]) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        AddMessageInfoToCache(pack);
    }
}


export function GetMessageInfo(serverId: string, msgId: string) {
    const cachedMsgInfo = GetMessageInfoFromCache(serverId, msgId);

    return cachedMsgInfo;
}


export function IsUserInTrade(userId: string) {
    for (const serverID in CachedMessageInfosPerServer) {
        const cachedMessages = CachedMessageInfosPerServer[serverID];

        const isInTrade = cachedMessages.some(m => {
            const message = m as PigTradeMessage;

            return message.Type === "PigTrade" &&
                (message.TradeStarterID === userId || message.TradeReceiverID === userId);
        });

        if (isInTrade) { return true; }
    }

    return false;
}


export function RemoveMessageInfoFromCache(msgInfo: MessageInfo) {
    const msgInfoCache = GetMsgInfoCacheForServer(msgInfo.ServerId);
    const index = msgInfoCache.indexOf(msgInfo);
    msgInfoCache.splice(index, 1);
}


export function GetTradeOfferForUser(userID: string) {
    for (const serverID in CachedMessageInfosPerServer) {
        const messagesCache = CachedMessageInfosPerServer[serverID];

        const foundTrade = messagesCache.find(m => {
            const message = m as PigTradeMessage;

            return message.Type === "PigTrade" && message.TradeReceiverID === userID;
        });

        if (foundTrade !== undefined) { return foundTrade as PigTradeMessage; }
    }

    return undefined;
}