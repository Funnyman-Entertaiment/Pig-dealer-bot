import { DiscordAPIError } from "discord.js";
import { LogError } from "../Utils/Log";

export default () => {
    process.on('unhandledRejection', error => {
        if(error instanceof DiscordAPIError){
            LogError(`${error.message}: ${error.url}`);
        }else if(error instanceof Error){
            if(error.stack !== undefined){
                LogError(`[${error.name}] ${error.message}: ${error.stack.trim()}`);
            }else{
                LogError(`[${error.name}] ${error.message}`);
            }
        }        
    });
};