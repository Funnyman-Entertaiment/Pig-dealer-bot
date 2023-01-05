"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveCachePeriodically = void 0;
const ServerInfo_1 = require("../database/ServerInfo");
const UserInfo_1 = require("../database/UserInfo");
function SaveCachePeriodically() {
    setInterval(() => {
        (0, ServerInfo_1.SaveAllServerInfo)();
        (0, UserInfo_1.SaveAllUserInfo)();
    }, 1000 * 60 * 60 * 12);
}
exports.SaveCachePeriodically = SaveCachePeriodically;
