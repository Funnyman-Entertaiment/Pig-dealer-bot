"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PackDropper_1 = require("../events/PackDropper");
const Commands_1 = require("../Commands");
const ReadInitialDatabase_1 = require("../database/ReadInitialDatabase");
const CacheSaver_1 = require("../events/CacheSaver");
const RemoveOldMessages_1 = require("../events/RemoveOldMessages");
const Bot_1 = require("../Bot");
const Variables_1 = require("../Constants/Variables");
const ResetServerAndUserInfo_1 = require("../events/ResetServerAndUserInfo");
const DatabaseCacheList_1 = require("../database/DatabaseCacheList");
exports.default = () => {
    Bot_1.client.on("ready", async () => {
        if (!Bot_1.client.user || !Bot_1.client.application) {
            return;
        }
        console.log(`Initializing ${Bot_1.client.user.username}...`);
        console.log(`Fetching pigs and packs information.`);
        (0, ReadInitialDatabase_1.ReadPigsAndPacks)();
        console.log(`Fetching dev server information.`);
        const devServer = await Bot_1.client.guilds.fetch(process.env.DEV_SERVER_ID ?? "");
        const reportChannel = (await devServer.channels.fetch(process.env.DEV_REPORT_CHANNEL ?? ""));
        const LogChannel = (await devServer.channels.fetch(process.env.DEV_LOG_CHANNEL ?? ""));
        Variables_1.DevSpace.Server = devServer;
        Variables_1.DevSpace.ReportChannel = reportChannel;
        Variables_1.DevSpace.LogChannel = LogChannel;
        console.log(`Fetching trade server information.`);
        const tradeServer = await Bot_1.client.guilds.fetch(process.env.TRADE_SERVER_ID ?? "");
        const tradeBulletinChannel = (await tradeServer.channels.fetch(process.env.TRADE_BULLETIN_CHANNEL_ID ?? ""));
        Variables_1.TradeServerSpace.Server = tradeServer;
        Variables_1.TradeServerSpace.TradeBulletinChannel = tradeBulletinChannel;
        console.log(`Resetting server and user informations.`);
        await (0, ResetServerAndUserInfo_1.ResetServerAndUserInfo)();
        (0, CacheSaver_1.SaveCachePeriodically)();
        (0, RemoveOldMessages_1.RemoveOldMessagesFromCache)();
        setInterval(() => (0, DatabaseCacheList_1.SaveItems)(), 1000);
        (0, Commands_1.SetCommands)();
        console.log(`Preparing commands...`);
        if (Commands_1.Commands.length !== 0) {
            console.log(`Setting application commands.`);
            await Bot_1.client.application.commands.set(Commands_1.Commands.map(c => c.slashCommand));
        }
        if (Commands_1.TradeServerCommands.length !== 0) {
            console.log(`Setting commands for the trade server.`);
            await Variables_1.TradeServerSpace.Server.commands.set(Commands_1.TradeServerCommands.map(c => c.slashCommand));
        }
        if (Commands_1.DebugCommands.length !== 0) {
            console.log(`Setting commands for the dev server`);
            await Variables_1.DevSpace.Server.commands.set(Commands_1.DebugCommands.map(c => c.slashCommand));
        }
        (0, PackDropper_1.PackDropper)();
        console.log(`${Bot_1.client.user.username} is online!`);
    });
};
