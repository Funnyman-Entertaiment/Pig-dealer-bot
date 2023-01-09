"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetServerInfo = exports.AddServerInfosToCache = exports.AddServerInfoToCache = exports.CreateServerInfoFromData = exports.SaveAllServerInfo = exports.ServerInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
const Bot_1 = require("../Bot");
class ServerInfo extends DatabaseElement_1.DatabaseElement {
    Channel;
    Role;
    HasSpawnedGoldenPig;
    YearsSpawnedAllNewYearDeco;
    Enabled;
    constructor(id, channel, role, hasSpawnedGoldenPig, yearsSpawnedAllNewYearDeco, enabled) {
        super(id);
        this.Channel = channel;
        this.Role = role;
        this.HasSpawnedGoldenPig = hasSpawnedGoldenPig;
        this.YearsSpawnedAllNewYearDeco = yearsSpawnedAllNewYearDeco;
        this.Enabled = enabled;
    }
    GetData() {
        const data = {
            HasSpawnedGoldenPig: this.HasSpawnedGoldenPig,
            YearsSpawnedAllNewYearDeco: this.YearsSpawnedAllNewYearDeco,
            Enabled: this.Enabled
        };
        if (this.Channel !== undefined) {
            data.Channel = this.Channel;
        }
        if (this.Role !== undefined) {
            data.Role = this.Role;
        }
        return data;
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
function SaveAllServerInfo() {
    CachedServerInfos?.SaveAll();
}
exports.SaveAllServerInfo = SaveAllServerInfo;
function CreateServerInfoFromData(id, serverInfoData) {
    const newPack = new ServerInfo(id, serverInfoData.Channel, serverInfoData.Role, serverInfoData.HasSpawnedGoldenPig ?? false, serverInfoData.YearsSpawnedAllNewYearDeco ?? [], serverInfoData.Enabled ?? true);
    return newPack;
}
exports.CreateServerInfoFromData = CreateServerInfoFromData;
async function AddServerInfoToCache(serverInfo) {
    await GetCachedServerInfos().Add(serverInfo);
}
exports.AddServerInfoToCache = AddServerInfoToCache;
async function AddServerInfosToCache(packs) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddServerInfoToCache(pack);
    }
}
exports.AddServerInfosToCache = AddServerInfosToCache;
async function GetServerInfo(serverId) {
    const cachedServerInfo = GetCachedServerInfos().Get(serverId);
    if (cachedServerInfo === undefined) {
        const packDocument = (0, lite_1.doc)(Bot_1.db, `serverInfo/${serverId}`);
        const foundServerInfo = await (0, lite_1.getDoc)(packDocument);
        if (foundServerInfo.exists()) {
            const serverInfoData = foundServerInfo.data();
            const newServerInfo = CreateServerInfoFromData(serverId, serverInfoData);
            AddServerInfoToCache(newServerInfo);
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
