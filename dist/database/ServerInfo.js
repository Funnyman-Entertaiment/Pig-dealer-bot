"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetServerInfo = exports.AddServerInfosToCache = exports.AddServerInfoToCache = exports.CreateServerInfoFromData = exports.SaveAllServerInfo = exports.CachedServerInfos = exports.ServerInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
const Bot_1 = require("../Bot");
class ServerInfo extends DatabaseElement_1.DatabaseElement {
    Channel;
    AnnouncementChannel;
    Role;
    HasSpawnedGoldenPig;
    YearsSpawnedAllNewYearDeco;
    YearsSpawnedLeprechaun;
    SafeMode;
    Enabled;
    constructor(id, channel, role, announcementChannel, hasSpawnedGoldenPig, yearsSpawnedAllNewYearDeco, yearsSpawnedLeprechaun, safeMode, enabled) {
        super(id);
        this.Channel = channel;
        this.Role = role;
        this.AnnouncementChannel = announcementChannel;
        this.HasSpawnedGoldenPig = hasSpawnedGoldenPig;
        this.YearsSpawnedAllNewYearDeco = yearsSpawnedAllNewYearDeco;
        this.YearsSpawnedLeprechaun = yearsSpawnedLeprechaun;
        this.SafeMode = safeMode;
        this.Enabled = enabled;
    }
    GetData() {
        const data = {
            HasSpawnedGoldenPig: this.HasSpawnedGoldenPig,
            YearsSpawnedAllNewYearDeco: this.YearsSpawnedAllNewYearDeco,
            YearsSpawnedLeprechaun: this.YearsSpawnedLeprechaun,
            Enabled: this.Enabled,
            SafeMode: this.SafeMode
        };
        if (this.Channel !== undefined) {
            data.Channel = this.Channel;
        }
        if (this.Role !== undefined) {
            data.Role = this.Role;
        }
        if (this.AnnouncementChannel !== undefined) {
            data.AnnouncementChannel = this.AnnouncementChannel;
        }
        return data;
    }
}
exports.ServerInfo = ServerInfo;
function GetCachedServerInfos() {
    if (exports.CachedServerInfos === undefined) {
        exports.CachedServerInfos = new DatabaseCacheList_1.DatabaseElementList();
    }
    return exports.CachedServerInfos;
}
function SaveAllServerInfo() {
    exports.CachedServerInfos?.SaveAll();
}
exports.SaveAllServerInfo = SaveAllServerInfo;
function CreateServerInfoFromData(id, serverInfoData) {
    const newPack = new ServerInfo(id, serverInfoData.Channel, serverInfoData.Role, serverInfoData.AnnouncementChannel ?? serverInfoData.Channel, serverInfoData.HasSpawnedGoldenPig ?? false, serverInfoData.YearsSpawnedAllNewYearDeco ?? [], serverInfoData.YearsSpawnedLeprechaun ?? [], serverInfoData.SafeMode ?? false, serverInfoData.Enabled ?? true);
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
