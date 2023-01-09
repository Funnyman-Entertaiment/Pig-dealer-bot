"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserInfo = exports.AddUserInfosToCache = exports.AddUserInfoToCache = exports.SaveAllUserInfo = exports.UserInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
const Bot_1 = require("../Bot");
class UserInfo extends DatabaseElement_1.DatabaseElement {
    LastTimeOpened;
    AssembledPigs;
    Pigs;
    WarnedAboutCooldown;
    constructor(id, assembledPigs, pigs, warnedAboutCooldown, lastTimeOpened) {
        super(id);
        this.AssembledPigs = assembledPigs;
        this.Pigs = pigs;
        this.LastTimeOpened = lastTimeOpened;
        this.WarnedAboutCooldown = warnedAboutCooldown;
    }
    GetData() {
        const data = {
            Pigs: this.Pigs,
            AssembledPigs: this.AssembledPigs,
            WarnedAboutCooldown: this.WarnedAboutCooldown
        };
        if (this.LastTimeOpened !== undefined) {
            data.LastTimeOpened = this.LastTimeOpened;
        }
        return data;
    }
}
exports.UserInfo = UserInfo;
let CachedUserInfos;
async function SaveAllUserInfo() {
    await CachedUserInfos?.SaveAll();
}
exports.SaveAllUserInfo = SaveAllUserInfo;
function CreateUserInfoFromData(id, userInfoData) {
    const newUserInfo = new UserInfo(id, userInfoData.AssembledPigs ?? [], userInfoData.Pigs ?? {}, userInfoData.WarnedAboutCooldown ?? false, userInfoData.LastTimeOpened);
    return newUserInfo;
}
function GetCachedUserInfos() {
    if (CachedUserInfos === undefined) {
        CachedUserInfos = new DatabaseCacheList_1.DatabaseElementList();
    }
    return CachedUserInfos;
}
async function AddUserInfoToCache(userInfo) {
    await GetCachedUserInfos().Add(userInfo);
}
exports.AddUserInfoToCache = AddUserInfoToCache;
async function AddUserInfosToCache(packs) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddUserInfoToCache(pack);
    }
}
exports.AddUserInfosToCache = AddUserInfosToCache;
async function GetUserInfo(userId) {
    const cachedUserInfo = GetCachedUserInfos().Get(userId);
    if (cachedUserInfo === undefined) {
        const userInfoDocument = (0, lite_1.doc)(Bot_1.db, `users/${userId}`);
        const foundUserInfo = await (0, lite_1.getDoc)(userInfoDocument);
        if (foundUserInfo.exists()) {
            const userInfoData = foundUserInfo.data();
            const newuserInfo = CreateUserInfoFromData(userId, userInfoData);
            AddUserInfoToCache(newuserInfo);
            return newuserInfo;
        }
        else {
            return undefined;
        }
    }
    else {
        return cachedUserInfo;
    }
}
exports.GetUserInfo = GetUserInfo;
