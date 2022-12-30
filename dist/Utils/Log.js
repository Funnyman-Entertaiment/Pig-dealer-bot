"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintUser = exports.PrintChannel = exports.PrintServer = exports.LogError = exports.LogWarn = exports.LogInfo = void 0;
function LogInfo(msg) {
    console.log(`[INFO] ${msg}`);
}
exports.LogInfo = LogInfo;
function LogWarn(msg) {
    console.log(`[WARN] ${msg}`);
}
exports.LogWarn = LogWarn;
function LogError(msg) {
    console.log(`[ERROR] ${msg}`);
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
