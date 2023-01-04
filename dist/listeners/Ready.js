"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PackDropper_1 = require("../events/PackDropper");
const Commands_1 = require("../Commands");
const ReadInitialDatabase_1 = require("../database/ReadInitialDatabase");
const CacheSaver_1 = require("../events/CacheSaver");
const RemoveOldMessages_1 = require("../events/RemoveOldMessages");
const Bot_1 = require("../Bot");
const Variables_1 = require("../Constants/Variables");
exports.default = () => {
    Bot_1.client.on("ready", async () => {
        if (!Bot_1.client.user || !Bot_1.client.application) {
            return;
        }
        (0, ReadInitialDatabase_1.ReadPigsAndPacks)();
        const guild = await Bot_1.client.guilds.fetch("1040735505127579718");
        if (guild !== undefined) {
            guild.commands.set(Commands_1.DebugCommands.map(c => c.slashCommand));
        }
        await Bot_1.client.application.commands.set(Commands_1.Commands.map(c => c.slashCommand));
        console.log(`${Bot_1.client.user.username} is online`);
        const devServer = await Bot_1.client.guilds.fetch("1040735505127579718");
        const reportChannel = (await devServer.channels.fetch("1056247295571665018"));
        const LogChannel = (await devServer.channels.fetch("1060270015724650536"));
        Variables_1.DevSpace.Server = devServer;
        Variables_1.DevSpace.ReportChannel = reportChannel;
        Variables_1.DevSpace.LogChannel = LogChannel;
        (0, PackDropper_1.PackDropper)();
        (0, CacheSaver_1.SaveCachePeriodically)();
        (0, RemoveOldMessages_1.RemoveOldMessagesFromCache)();
    });
};
