"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetServerAndUserInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const ServerInfo_1 = require("../database/ServerInfo");
const UserInfo_1 = require("../database/UserInfo");
const Log_1 = require("../Utils/Log");
async function ResetServerUsers() {
    (0, Log_1.LogInfo)("Resetting server and user information.");
    const serverQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(serverQuery);
    for (let i = 0; i < servers.size; i++) {
        const element = servers.docs[i];
        const serverInfo = await (0, ServerInfo_1.GetServerInfo)(element.id);
        console.log(`Server: ${i + 1}/${servers.size} (${element.id})`);
        await new Promise(r => setTimeout(r, 100));
        if (serverInfo !== undefined) {
            serverInfo.Enabled = true;
            await (0, ServerInfo_1.AddServerInfoToCache)(serverInfo);
        }
    }
    (0, ServerInfo_1.SaveAllServerInfo)();
    const usersQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "users"));
    const users = await (0, lite_1.getDocs)(usersQuery);
    for (let i = 0; i < users.size; i++) {
        const element = users.docs[i];
        const userInfo = await (0, UserInfo_1.GetUserInfo)(element.id);
        console.log(`User: ${i + 1}/${users.size} (${element.id})`);
        await new Promise(r => setTimeout(r, 100));
        if (userInfo !== undefined) {
            userInfo.WarnedAboutCooldown = false;
            await (0, UserInfo_1.AddUserInfoToCache)(userInfo);
        }
    }
    (0, UserInfo_1.SaveAllUserInfo)();
}
async function ResetServerAndUserInfo() {
    await ResetServerUsers();
    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}
exports.ResetServerAndUserInfo = ResetServerAndUserInfo;
