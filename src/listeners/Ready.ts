import { Client } from "discord.js";
import { Firestore } from "firebase/firestore/lite";
import { PackDropper } from "../events/PackDropper";
import { Commands, DebugCommands } from "../Commands";
import { ReadPigsAndPacks } from "../database/ReadInitialDatabase";
import { SaveCachePeriodically } from "../events/CacheSaver";
import { RemoveOldMessagesFromCache } from "../events/RemoveOldMessages";
import { client, db } from "../Bot";

export default () => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        ReadPigsAndPacks();

        const guild = await client.guilds.fetch("1040735505127579718");

        if(guild !== undefined){
            guild.commands.set(DebugCommands.map(c => c.slashCommand));
        }

        await client.application.commands.set(Commands.map(c => c.slashCommand));

        console.log(`${client.user.username} is online`);

        PackDropper(client, db);
        SaveCachePeriodically();
        RemoveOldMessagesFromCache();
    });
};