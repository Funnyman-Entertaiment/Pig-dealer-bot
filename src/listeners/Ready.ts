import { PackDropper } from "../events/PackDropper";
import { Commands, DebugCommands, SetCommands, TradeServerCommands } from "../Commands";
import { ReadPigsAndPacks } from "../database/ReadInitialDatabase";
import { SaveCachePeriodically } from "../events/CacheSaver";
import { RemoveOldMessagesFromCache } from "../events/RemoveOldMessages";
import { client } from "../Bot";
import { GuildTextBasedChannel } from "discord.js";
import { DevSpace, TradeServerSpace } from "../Constants/Variables";
import { ResetServerAndUserInfo } from "../events/ResetServerAndUserInfo";
import { SaveItems } from "../database/DatabaseCacheList";
import { CachedServerInfos } from "../database/ServerInfo";

export default () => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        console.log(`Initializing ${client.user.username}...`);

        console.log(`Fetching pigs and packs information.`);
        ReadPigsAndPacks();

        console.log(`Fetching dev server information.`);
        const devServer = await client.guilds.fetch(process.env.DEV_SERVER_ID ?? "");
        const reportChannel = (await devServer.channels.fetch(process.env.DEV_REPORT_CHANNEL ?? "")) as GuildTextBasedChannel;
        const LogChannel = (await devServer.channels.fetch(process.env.DEV_LOG_CHANNEL ?? "")) as GuildTextBasedChannel;

        DevSpace.Server = devServer;
        DevSpace.ReportChannel = reportChannel;
        DevSpace.LogChannel = LogChannel;

        console.log(`Fetching trade server information.`);
        const tradeServer = await client.guilds.fetch(process.env.TRADE_SERVER_ID?? "");
        const tradeBulletinChannel = (await tradeServer.channels.fetch(process.env.TRADE_BULLETIN_CHANNEL_ID?? "")) as GuildTextBasedChannel;

        TradeServerSpace.Server = tradeServer;
        TradeServerSpace.TradeBulletinChannel = tradeBulletinChannel;

        console.log(`Resetting server and user informations.`);
        await ResetServerAndUserInfo();
        SaveCachePeriodically();
        RemoveOldMessagesFromCache();
        
        setInterval(() => SaveItems(), 1000);

        SetCommands();

        console.log(`Preparing commands...`);
        if(Commands.length !== 0){
            console.log(`Setting application commands.`);
            await client.application.commands.set(Commands.map(c => c.slashCommand));
        }
        if(TradeServerCommands.length !== 0){
            console.log(`Setting commands for the trade server.`);
            await TradeServerSpace.Server.commands.set(TradeServerCommands.map(c => c.slashCommand));
        }
        if(DebugCommands.length !== 0){
            console.log(`Setting commands for the dev server`);
            await DevSpace.Server.commands.set(DebugCommands.map(c => c.slashCommand));
        }

        PackDropper();

        console.log(`${client.user.username} is online!`);
    });
};