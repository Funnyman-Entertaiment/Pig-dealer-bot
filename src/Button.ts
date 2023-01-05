import { ButtonInteraction } from "discord.js";

export class Button{
    id;
    response;

    constructor(id: string, 
    response: (interaction: ButtonInteraction) => void){
        this.id = id;
        this.response = response
    }
}
