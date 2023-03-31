"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetServerAndUserInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("../Bot");
const Log_1 = require("../Utils/Log");
async function ResetServerUsers() {
    (0, Log_1.LogInfo)("Resetting server and user information.");
    const batch = (0, lite_1.writeBatch)(Bot_1.db);
    const serverQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(serverQuery);
    for (let i = 0; i < servers.size; i++) {
        const element = servers.docs[i];
        batch.update(element.ref, {
            Enabled: true
        });
    }
    const usersQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "users"));
    const users = await (0, lite_1.getDocs)(usersQuery);
    for (let i = 0; i < users.size; i++) {
        const element = users.docs[i];
        batch.update(element.ref, {
            WarnedAboutCooldown: true
        });
    }
    await batch.commit();
}
async function ResetServerAndUserInfo() {
    await ResetServerUsers();
    setInterval(async () => {
        ResetServerUsers();
    }, 1000 * 60 * 60 * 24 * 7);
}
exports.ResetServerAndUserInfo = ResetServerAndUserInfo;
