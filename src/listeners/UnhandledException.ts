import { DiscordAPIError } from "discord.js";
import { LogError } from "../Utils/Log";

export default () => {
    process.on('unhandledRejection', error => {
        const e = error as DiscordAPIError;
        LogError(`${e.message}: ${e.url}`);
    });
};