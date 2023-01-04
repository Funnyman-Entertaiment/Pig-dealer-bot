"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveOldMessagesFromCache = void 0;
const lite_1 = require("firebase/firestore/lite");
const MessageInfo_1 = require("../database/MessageInfo");
function RemoveOldMessagesFromCache() {
    setInterval(() => {
        const currentTime = lite_1.Timestamp.now();
        for (const serverID in MessageInfo_1.CachedMessageInfosPerServer) {
            const messages = MessageInfo_1.CachedMessageInfosPerServer[serverID];
            MessageInfo_1.CachedMessageInfosPerServer[serverID] = messages.filter(msg => {
                if (msg.Type === "PigTrade") {
                    return currentTime.seconds - msg.TimeSent.seconds <= 60 * 15;
                }
                else {
                    return currentTime.seconds - msg.TimeSent.seconds <= 60 * 60 * 3;
                }
            });
        }
    }, 1000 * 60 * 10);
}
exports.RemoveOldMessagesFromCache = RemoveOldMessagesFromCache;
