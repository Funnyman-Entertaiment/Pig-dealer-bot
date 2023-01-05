"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrySendAutoRemoveMessage = exports.TrySendMessageToChannel = void 0;
const discord_js_1 = require("discord.js");
const Bot_1 = require("../Bot");
const Log_1 = require("./Log");
const lite_1 = require("firebase/firestore/lite");
async function TrySendMessageToChannel(serverId, channelId, message) {
    const server = await Bot_1.client.guilds.fetch(serverId);
    const channel = await server.channels.fetch(channelId);
    const serverBotUser = server.members.me;
    if (serverBotUser === null) {
        (0, Log_1.LogError)(`Couldn't find bot user in server ${(0, Log_1.PrintServer)(server)}`);
        return;
    }
    if (channel === undefined || channel === null) {
        (0, Log_1.LogError)(`Couldn't find channel ${channelId} in server ${(0, Log_1.PrintServer)(server)}`);
        return;
    }
    if (channel.type !== discord_js_1.ChannelType.GuildText) {
        (0, Log_1.LogError)(`Channel ${(0, Log_1.PrintChannel)(channel)} is not text based in server ${(0, Log_1.PrintServer)(server)}`);
        return;
    }
    const timeoutedDate = serverBotUser.communicationDisabledUntil;
    if (timeoutedDate !== undefined && timeoutedDate !== null) {
        const currentDate = lite_1.Timestamp.now().toDate();
        if (currentDate < timeoutedDate) {
            (0, Log_1.LogWarn)(`Bot is timeouted in ${(0, Log_1.PrintServer)(server)}`);
            return;
        }
    }
    const permissions = serverBotUser.permissionsIn(channel);
    if (!permissions.has("SendMessages") || !permissions.has("ViewChannel")) {
        (0, Log_1.LogWarn)(`Not enough permissions to send messages in ${(0, Log_1.PrintServer)(server)}`);
        return;
    }
    try {
        const msgPromise = channel.send(message);
        return msgPromise;
    }
    catch (error) {
        (0, Log_1.LogError)(`There was an error sending a message to ${(0, Log_1.PrintServer)(server)} => ${error}`);
        return;
    }
}
exports.TrySendMessageToChannel = TrySendMessageToChannel;
async function TrySendAutoRemoveMessage(serverId, channelId, message) {
    const msgPromise = TrySendMessageToChannel(serverId, channelId, message);
    if (msgPromise === undefined) {
        return;
    }
    msgPromise.then(message => {
        message?.delete();
    });
}
exports.TrySendAutoRemoveMessage = TrySendAutoRemoveMessage;
