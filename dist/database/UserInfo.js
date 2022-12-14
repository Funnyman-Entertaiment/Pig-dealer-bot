"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserInfo = exports.AddUserInfosToCache = exports.AddUserInfoToCache = exports.UserInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
class UserInfo extends DatabaseElement_1.DatabaseElement {
    ServerId;
    LastTimeOpened;
    AssembledPigs;
    constructor(id, serverId, assembledPigs, lastTimeOpened) {
        super(id);
        this.ServerId = serverId;
        this.AssembledPigs = assembledPigs;
        this.LastTimeOpened = lastTimeOpened;
    }
    GetData() {
        if (this.LastTimeOpened === undefined) {
            return {
                AssembledPigs: this.AssembledPigs
            };
        }
        else {
            return {
                LastTimeOpened: this.LastTimeOpened,
                AssembledPigs: this.AssembledPigs
            };
        }
    }
}
exports.UserInfo = UserInfo;
const CachedUserInfosPerServer = {};
function CreateUserInfoFromData(id, serverId, userInfoData) {
    const newUserInfo = new UserInfo(id, serverId, userInfoData.AssembledPigs, userInfoData.LastTimeOpened);
    return newUserInfo;
}
function GetUserInfoCacheForServer(serverId) {
    let userInfoCacheForServer = CachedUserInfosPerServer[serverId];
    if (userInfoCacheForServer === undefined) {
        CachedUserInfosPerServer[serverId] = new DatabaseCacheList_1.DatabaseElementList();
        userInfoCacheForServer = CachedUserInfosPerServer[serverId];
    }
    return userInfoCacheForServer;
}
function GetUserInfoFromCache(serverId, userId) {
    let cachedUserInfos = GetUserInfoCacheForServer(serverId);
    return cachedUserInfos.Get(userId);
}
async function AddUserInfoToCache(msgInfo, db) {
    let cachedMessageInfos = GetUserInfoCacheForServer(msgInfo.ServerId);
    await cachedMessageInfos.Add(msgInfo, db);
}
exports.AddUserInfoToCache = AddUserInfoToCache;
async function AddUserInfosToCache(packs, db) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddUserInfoToCache(pack, db);
    }
}
exports.AddUserInfosToCache = AddUserInfosToCache;
async function GetUserInfo(serverId, userId, db) {
    const cachedServerInfo = GetUserInfoFromCache(serverId, userId);
    if (cachedServerInfo === undefined) {
        const userInfoDocument = (0, lite_1.doc)(db, `serverInfo/${serverId}/users/${userId}`);
        const foundUserInfo = await (0, lite_1.getDoc)(userInfoDocument);
        if (foundUserInfo.exists()) {
            const userInfoData = foundUserInfo.data();
            const newuserInfo = CreateUserInfoFromData(userId, serverId, userInfoData);
            AddUserInfoToCache(newuserInfo, db);
            return newuserInfo;
        }
        else {
            return undefined;
        }
    }
    else {
        return cachedServerInfo;
    }
}
exports.GetUserInfo = GetUserInfo;
