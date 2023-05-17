"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetServerAndUserInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const Log_1 = require("../Utils/Log");
async function ResetServerUsers() {
    (0, Log_1.LogInfo)("Resetting server and user information.");
    const serverGroups = [];
    serverGroups.push([]);
    const serverQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(serverQuery);
    servers.forEach(server => {
        if (serverGroups[serverGroups.length - 1].length >= 400) {
            serverGroups.push([]);
        }
        serverGroups[serverGroups.length - 1].push(server);
    });
    for (let i = 0; i < serverGroups.length; i++) {
        const batch = (0, lite_1.writeBatch)(Bot_1.db);
        const serverDocs = serverGroups[i];
        serverDocs.forEach(element => {
            batch.update(element.ref, {
                Enabled: true
            });
        });
        await batch.commit();
    }
    const userGroups = [];
    userGroups.push([]);
    const usersQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "users"));
    const users = await (0, lite_1.getDocs)(usersQuery);
    users.forEach(server => {
        if (userGroups[userGroups.length - 1].length >= 400) {
            userGroups.push([]);
        }
        userGroups[userGroups.length - 1].push(server);
    });
    for (let i = 0; i < userGroups.length; i++) {
        const batch = (0, lite_1.writeBatch)(Bot_1.db);
        const userDocs = userGroups[i];
        userDocs.forEach(element => {
            batch.update(element.ref, {
                WarnedAboutCooldown: false
            });
        });
        await batch.commit();
    }
}
async function ResetServerAndUserInfo() {
    await ResetServerUsers();
    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}
exports.ResetServerAndUserInfo = ResetServerAndUserInfo;
