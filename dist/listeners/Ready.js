"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PackDropper_1 = require("../events/PackDropper");
const Commands_1 = require("../Commands");
const ReadInitialDatabase_1 = require("../database/ReadInitialDatabase");
const CacheSaver_1 = require("../events/CacheSaver");
const RemoveOldMessages_1 = require("../events/RemoveOldMessages");
const Bot_1 = require("../Bot");
const Variables_1 = require("../Constants/Variables");
const lite_1 = require("firebase/firestore/lite");
exports.default = () => {
    Bot_1.client.on("ready", async () => {
        if (!Bot_1.client.user || !Bot_1.client.application) {
            return;
        }
        const q = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "serverInfo"));
        const servers = await (0, lite_1.getDocs)(q);
        for (let i = 0; i < servers.size; i++) {
            const element = servers.docs[i];
            const serverDoc = (0, lite_1.doc)(Bot_1.db, `serverInfo/${element.id}`);
            await (0, lite_1.updateDoc)(serverDoc, {
                Enabled: true
            });
        }
        (0, ReadInitialDatabase_1.ReadPigsAndPacks)();
        console.log(`${Bot_1.client.user.username} is online`);
        const devServer = await Bot_1.client.guilds.fetch("1040735505127579718");
        const reportChannel = (await devServer.channels.fetch("1056247295571665018"));
        const LogChannel = (await devServer.channels.fetch("1060270015724650536"));
        Variables_1.DevSpace.Server = devServer;
        Variables_1.DevSpace.ReportChannel = reportChannel;
        Variables_1.DevSpace.LogChannel = LogChannel;
        const tradeServer = await Bot_1.client.guilds.fetch(process.env.TRADE_SERVER_ID ?? "");
        const tradeBulletinChannel = (await tradeServer.channels.fetch(process.env.TRADE_BULLETIN_CHANNEL_ID ?? ""));
        Variables_1.TradeServerSpace.Server = tradeServer;
        Variables_1.TradeServerSpace.TradeBulletinChannel = tradeBulletinChannel;
        await Bot_1.client.application.commands.set(Commands_1.Commands.map(c => c.slashCommand));
        await Variables_1.DevSpace.Server.commands.set(Commands_1.DebugCommands.map(c => c.slashCommand));
        await Variables_1.TradeServerSpace.Server.commands.set(Commands_1.TradeServerCommands.map(c => c.slashCommand));
        (0, PackDropper_1.PackDropper)();
        (0, CacheSaver_1.SaveCachePeriodically)();
        (0, RemoveOldMessages_1.RemoveOldMessagesFromCache)();
    });
};
