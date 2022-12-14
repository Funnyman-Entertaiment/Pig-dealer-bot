"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PackDropper_1 = require("../events/PackDropper");
const Commands_1 = require("../Commands");
exports.default = (client, db) => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        await client.application.commands.set(Commands_1.Commands.map(c => c.slashCommand));
        console.log(`${client.user.username} is online`);
    });
    (0, PackDropper_1.PackDropper)(client, db);
};
