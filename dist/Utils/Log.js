"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintUser = exports.PrintChannel = exports.PrintServer = exports.LogError = exports.LogWarn = exports.LogInfo = void 0;
const Variables_1 = require("../Constants/Variables");
const Bot_1 = require("../Bot");
function SendLogMessage(msg) {
    console.log(msg);
    if (Bot_1.client.user !== null) {
        Variables_1.DevSpace.LogChannel.send(msg);
    }
}
function LogInfo(msg) {
    SendLogMessage(`[INFO] ${msg}`);
}
exports.LogInfo = LogInfo;
function LogWarn(msg) {
    SendLogMessage(`[WARN] ${msg}`);
}
exports.LogWarn = LogWarn;
function LogError(msg) {
    SendLogMessage(`[ERROR] ${msg}`);
}
exports.LogError = LogError;
function PrintServer(server) {
    return `${server.id} [${server.name}]`;
}
exports.PrintServer = PrintServer;
function PrintChannel(channel) {
    if (channel === undefined || channel === null) {
        return "- [-]";
    }
    return `${channel.id} [${channel.name}]`;
}
exports.PrintChannel = PrintChannel;
function PrintUser(user) {
    return `${user.id} [${user.username}]`;
}
exports.PrintUser = PrintUser;
