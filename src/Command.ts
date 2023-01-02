import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export class Command{
    slashCommand;
    response;

    constructor(slashCommand: SlashCommandBuilder, 
    response: (interaction: CommandInteraction) => void){
        this.slashCommand = slashCommand;
        this.response = response
    }
}
