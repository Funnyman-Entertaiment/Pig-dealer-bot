import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Firestore } from "firebase/firestore/lite";

export class Command{
    slashCommand;
    response;

    constructor(slashCommand: SlashCommandBuilder, 
    response: (client: Client, interaction: CommandInteraction, db: Firestore) => void){
        this.slashCommand = slashCommand;
        this.response = response
    }
}
