"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetServerInfo = exports.AddServerInfosToCache = exports.AddServerInfoToCache = exports.ServerInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
class ServerInfo extends DatabaseElement_1.DatabaseElement {
    Channel;
    HasSpawnedGoldenPig;
    constructor(id, channel, hasSpawnedGoldenPig) {
        super(id);
        this.Channel = channel;
        this.HasSpawnedGoldenPig = hasSpawnedGoldenPig;
    }
    GetData() {
        return {
            Channel: this.Channel,
            HasSpawnedGoldenPig: this.HasSpawnedGoldenPig,
        };
    }
}
exports.ServerInfo = ServerInfo;
let CachedServerInfos;
function GetCachedServerInfos() {
    if (CachedServerInfos === undefined) {
        CachedServerInfos = new DatabaseCacheList_1.DatabaseElementList();
    }
    return CachedServerInfos;
}
function CreateServerInfoFromData(id, serverInfoData) {
    const newPack = new ServerInfo(id, serverInfoData.Channel, serverInfoData.HasSpawnedGoldenPig ?? false);
    return newPack;
}
async function AddServerInfoToCache(serverInfo, db) {
    await GetCachedServerInfos().Add(serverInfo, db);
}
exports.AddServerInfoToCache = AddServerInfoToCache;
async function AddServerInfosToCache(packs, db) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddServerInfoToCache(pack, db);
    }
}
exports.AddServerInfosToCache = AddServerInfosToCache;
async function GetServerInfo(serverId, db) {
    const cachedServerInfo = GetCachedServerInfos().Get(serverId);
    if (cachedServerInfo === undefined) {
        const packDocument = (0, lite_1.doc)(db, `serverInfo/${serverId}`);
        const foundServerInfo = await (0, lite_1.getDoc)(packDocument);
        if (foundServerInfo.exists()) {
            const serverInfoData = foundServerInfo.data();
            const newServerInfo = CreateServerInfoFromData(serverId, serverInfoData);
            AddServerInfoToCache(newServerInfo, db);
            return newServerInfo;
        }
        else {
            return undefined;
        }
    }
    else {
        return cachedServerInfo;
    }
}
exports.GetServerInfo = GetServerInfo;
