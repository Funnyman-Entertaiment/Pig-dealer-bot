"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserPigs = exports.GetUserPigIDs = exports.GetUserInfo = exports.AddUserInfosToCache = exports.AddUserInfoToCache = exports.SaveAllUserInfo = exports.UserInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
const Bot_1 = require("../Bot");
const Pigs_1 = require("./Pigs");
class UserInfo extends DatabaseElement_1.DatabaseElement {
    LastTimeOpened;
    AssembledPigs;
    Pigs;
    WarnedAboutCooldown;
    FavouritePigs;
    BulletinMsgId;
    constructor(id, assembledPigs, pigs, warnedAboutCooldown, favouritePigs, bulletinMsgId, lastTimeOpened) {
        super(id);
        this.AssembledPigs = assembledPigs;
        this.Pigs = pigs;
        this.LastTimeOpened = lastTimeOpened;
        this.WarnedAboutCooldown = warnedAboutCooldown;
        this.FavouritePigs = favouritePigs;
        this.BulletinMsgId = bulletinMsgId;
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
        if (this.BulletinMsgId !== undefined) {
            data.BulletinMsgId = this.BulletinMsgId;
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
    const newUserInfo = new UserInfo(id, userInfoData.AssembledPigs ?? [], userInfoData.Pigs ?? {}, userInfoData.WarnedAboutCooldown ?? false, userInfoData.FavouritePigs ?? [], userInfoData.BulletinMsgId, userInfoData.LastTimeOpened);
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
function GetUserPigIDs(userInfo) {
    if (userInfo === undefined) {
        return [];
    }
    const userPigs = [];
    for (const pigId in userInfo.Pigs) {
        userPigs.push(pigId);
    }
    return userPigs;
}
exports.GetUserPigIDs = GetUserPigIDs;
function GetUserPigs(userInfo) {
    return GetUserPigIDs(userInfo).map(pigID => (0, Pigs_1.GetPig)(pigID));
}
exports.GetUserPigs = GetUserPigs;
