"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMessageInfo = exports.AddMessageInfosToCache = exports.AddMessageInfoToCache = exports.GetMessageInfoFromCache = exports.GetMsgInfoCacheForServer = exports.CreateMessageInfoFromData = exports.PigGalleryMessage = exports.RandomPackMessage = exports.MessageInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
class MessageInfo extends DatabaseElement_1.DatabaseElement {
    ServerId;
    Type;
    User;
    constructor(id, serverId, type, user) {
        super(id);
        this.ServerId = serverId;
        this.Type = type;
        this.User = user;
    }
}
exports.MessageInfo = MessageInfo;
class RandomPackMessage extends MessageInfo {
    Name;
    PigCount;
    Set;
    Tags;
    Opened;
    constructor(id, serverId, name, pigCount, set, tags, opened, user) {
        super(id, serverId, "RandomPack", user);
        this.Name = name;
        this.PigCount = pigCount,
            this.Set = set;
        this.Tags = tags;
        this.Opened = opened;
    }
    GetData() {
        if (this.User === undefined) {
            return {
                Type: this.Type,
                Name: this.Name,
                PigCount: this.PigCount,
                Set: this.Set,
                Tags: this.Tags,
                Opened: this.Opened
            };
        }
        else {
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
exports.RandomPackMessage = RandomPackMessage;
class PigGalleryMessage extends MessageInfo {
    CurrentPig;
    Pigs;
    NewPigs;
    constructor(id, serverId, currentPig, pigs, newPigs, user) {
        super(id, serverId, "PigGallery", user);
        this.CurrentPig = currentPig;
        this.Pigs = pigs;
        this.NewPigs = newPigs;
    }
    GetData() {
        if (this.User === undefined) {
            return {
                Type: this.Type,
                CurrentPig: this.CurrentPig,
                Pigs: this.Pigs,
                NewPigs: this.NewPigs
            };
        }
        else {
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
exports.PigGalleryMessage = PigGalleryMessage;
const CachedMessageInfosPerServer = {};
function CreateMessageInfoFromData(id, serverId, msgInfoData) {
    const msgType = msgInfoData.Type;
    if (msgType == "RandomPack") {
        const newRandomPackMsg = new RandomPackMessage(id, serverId, msgInfoData.Name, msgInfoData.PigCount, msgInfoData.Set, msgInfoData.Tags, msgInfoData.Opened, msgInfoData.User);
        return newRandomPackMsg;
    }
    else {
        const newPigGalleryMsg = new PigGalleryMessage(id, serverId, msgInfoData.CurrentPig, msgInfoData.Pigs, msgInfoData.NewPigs, msgInfoData.User);
        return newPigGalleryMsg;
    }
}
exports.CreateMessageInfoFromData = CreateMessageInfoFromData;
function GetMsgInfoCacheForServer(serverId) {
    let msgInfoCacheForServer = CachedMessageInfosPerServer[serverId];
    if (msgInfoCacheForServer === undefined) {
        CachedMessageInfosPerServer[serverId] = new DatabaseCacheList_1.DatabaseElementList();
        msgInfoCacheForServer = CachedMessageInfosPerServer[serverId];
    }
    return msgInfoCacheForServer;
}
exports.GetMsgInfoCacheForServer = GetMsgInfoCacheForServer;
function GetMessageInfoFromCache(serverId, msgId) {
    let cachedMessageInfos = GetMsgInfoCacheForServer(serverId);
    const found = cachedMessageInfos.Get(msgId);
    return found;
}
exports.GetMessageInfoFromCache = GetMessageInfoFromCache;
async function AddMessageInfoToCache(msgInfo, db) {
    let cachedMessageInfos = GetMsgInfoCacheForServer(msgInfo.ServerId);
    await cachedMessageInfos.Add(msgInfo, db);
}
exports.AddMessageInfoToCache = AddMessageInfoToCache;
async function AddMessageInfosToCache(packs, db) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddMessageInfoToCache(pack, db);
    }
}
exports.AddMessageInfosToCache = AddMessageInfosToCache;
async function GetMessageInfo(serverId, msgId, db) {
    const cachedMsgInfo = GetMessageInfoFromCache(serverId, msgId);
    if (cachedMsgInfo === undefined) {
        const msgInfoDocument = (0, lite_1.doc)(db, `serverInfo/${serverId}/messages/${msgId}`);
        const foundMsgInfo = await (0, lite_1.getDoc)(msgInfoDocument);
        if (foundMsgInfo.exists()) {
            const serverInfoData = foundMsgInfo.data();
            const newServerInfo = CreateMessageInfoFromData(msgId, serverId, serverInfoData);
            AddMessageInfoToCache(newServerInfo, db);
            return newServerInfo;
        }
        else {
            return undefined;
        }
    }
    else {
        return cachedMsgInfo;
    }
}
exports.GetMessageInfo = GetMessageInfo;
