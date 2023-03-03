"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Log_1 = require("../Utils/Log");
exports.default = () => {
    process.on('unhandledRejection', error => {
        if (error instanceof discord_js_1.DiscordAPIError) {
            (0, Log_1.LogError)(`${error.message}: ${error.url}`);
        }
        else if (error instanceof Error) {
            if (error.stack !== undefined) {
                (0, Log_1.LogError)(`[${error.name}] ${error.message}: ${error.stack.trim()}`);
            }
            else {
                (0, Log_1.LogError)(`[${error.name}] ${error.message}`);
            }
        }
    });
};
