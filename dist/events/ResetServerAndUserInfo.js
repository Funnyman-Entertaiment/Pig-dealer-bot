"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetServerAndUserInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const ServerInfo_1 = require("../database/ServerInfo");
const UserInfo_1 = require("../database/UserInfo");
async function ResetServerUsers() {
    const serverQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(serverQuery);
    for (let i = 0; i < servers.size; i++) {
        const element = servers.docs[i];
        const serverInfo = await (0, ServerInfo_1.GetServerInfo)(element.id);
        console.log(`Server: ${i + 1}/${servers.size}`);
        if (serverInfo !== undefined) {
            serverInfo.Enabled = true;
        }
    }
    const usersQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "users"));
    const users = await (0, lite_1.getDocs)(usersQuery);
    for (let i = 0; i < users.size; i++) {
        const element = users.docs[i];
        const userInfo = await (0, UserInfo_1.GetUserInfo)(element.id);
        console.log(`User: ${i + 1}/${users.size}`);
        if (userInfo !== undefined) {
            userInfo.WarnedAboutCooldown = false;
        }
    }
}
async function ResetServerAndUserInfo() {
    await ResetServerUsers();
    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}
exports.ResetServerAndUserInfo = ResetServerAndUserInfo;
