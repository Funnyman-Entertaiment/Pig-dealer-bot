import { PackDropper } from "../events/PackDropper";
import { Commands, DebugCommands, TradeServerCommands } from "../Commands";
import { ReadPigsAndPacks } from "../database/ReadInitialDatabase";
import { SaveCachePeriodically } from "../events/CacheSaver";
import { RemoveOldMessagesFromCache } from "../events/RemoveOldMessages";
import { client, db } from "../Bot";
import { GuildTextBasedChannel } from "discord.js";
import { DevSpace, TradeServerSpace } from "../Constants/Variables";
import { query, collection, getDocs, doc, updateDoc } from "firebase/firestore/lite";

export default () => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        const q = query(collection(db, "serverInfo"));
        const servers = await getDocs(q);

        for (let i = 0; i < servers.size; i++) {
            const element = servers.docs[i];
            
            const serverDoc = doc(db, `serverInfo/${element.id}`);
            await updateDoc(serverDoc, {
                Enabled: true
            });
        }

        ReadPigsAndPacks();

        console.log(`${client.user.username} is online`);

        const devServer = await client.guilds.fetch("1040735505127579718");
        const reportChannel = (await devServer.channels.fetch("1056247295571665018")) as GuildTextBasedChannel;
        const LogChannel = (await devServer.channels.fetch("1060270015724650536")) as GuildTextBasedChannel;

        DevSpace.Server = devServer;
        DevSpace.ReportChannel = reportChannel;
        DevSpace.LogChannel = LogChannel;

        const tradeServer = await client.guilds.fetch(process.env.TRADE_SERVER_ID?? "");
        const tradeBulletinChannel = (await tradeServer.channels.fetch(process.env.TRADE_BULLETIN_CHANNEL_ID?? "")) as GuildTextBasedChannel;

        TradeServerSpace.Server = tradeServer;
        TradeServerSpace.TradeBulletinChannel = tradeBulletinChannel;

        await client.application.commands.set(Commands.map(c => c.slashCommand));
        await DevSpace.Server.commands.set(DebugCommands.map(c => c.slashCommand));
        await TradeServerSpace.Server.commands.set(TradeServerCommands.map(c => c.slashCommand));

        PackDropper();
        SaveCachePeriodically();
        RemoveOldMessagesFromCache();
    });
};