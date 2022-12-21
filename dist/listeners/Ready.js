"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PackDropper_1 = require("../events/PackDropper");
const Commands_1 = require("../Commands");
const ReadInitialDatabase_1 = require("../database/ReadInitialDatabase");
exports.default = (client, db) => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        (0, ReadInitialDatabase_1.ReadPigsAndPacks)();
        const guild = await client.guilds.fetch("1040735505127579718");
        if (guild !== undefined) {
            guild.commands.set(Commands_1.DebugCommands.map(c => c.slashCommand));
        }
        await client.application.commands.set(Commands_1.Commands.map(c => c.slashCommand));
        console.log(`${client.user.username} is online`);
    });
    (0, PackDropper_1.PackDropper)(client, db);
};
