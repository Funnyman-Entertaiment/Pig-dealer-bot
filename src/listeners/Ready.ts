import { Client } from "discord.js";
import { Firestore } from "firebase/firestore/lite";
import { PackDropper } from "../events/PackDropper";
import { Commands } from "../Commands";

export default (client: Client, db: Firestore) => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        await client.application.commands.set(Commands.map(c => c.slashCommand));

        console.log(`${client.user.username} is online`);
    });

    PackDropper(client, db)
};